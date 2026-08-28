import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

import { run as runReview } from './codex-code-review.mjs'

const REVIEWABLE_FILE_PATTERN = /\.(?:ts|tsx|js|jsx|mjs|cjs|vue|css|scss|json)$/i
const PATH_KEYS = new Set([
  'file',
  'filepath',
  'file_path',
  'path',
  'files',
  'paths',
  'changedfiles',
  'changed_files',
])
const SEVERITIES = ['high', 'medium', 'low', 'info']

function normalizePath(filePath) {
  return String(filePath).replaceAll('\\', '/').replace(/^\.\//, '')
}

function collectPaths(value, result, depth = 0) {
  if (depth > 3 || value == null) return
  if (typeof value === 'string') {
    const normalized = normalizePath(value)
    if (normalized && !normalized.startsWith('{') && !normalized.startsWith('[')) result.push(normalized)
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) collectPaths(item, result, depth + 1)
    return
  }
  if (typeof value !== 'object') return
  for (const [key, nested] of Object.entries(value)) {
    if (PATH_KEYS.has(key.toLowerCase())) collectPaths(nested, result, depth + 1)
  }
}

export function extractHookPaths(event) {
  const paths = []
  collectPaths(event, paths)
  return [...new Set(paths)]
}

export function shouldReviewPaths(paths) {
  return paths.length === 0 || paths.some((filePath) => {
    const normalized = normalizePath(filePath)
    return REVIEWABLE_FILE_PATTERN.test(normalized) && !normalized.includes('/node_modules/') && !normalized.includes('/dist/')
  })
}

export function buildReviewArgs({ base, failOn = 'high' } = {}) {
  const args = ['--scope', 'changed-files', '--format', 'json']
  if (base) args.push('--base', base)
  if (failOn !== 'high') args.push('--severity', failOn)
  return args
}

function parseReport(output) {
  try {
    return JSON.parse(output)
  } catch {
    return null
  }
}

function reportHasSeverity(report, severity) {
  if (!report?.summary?.bySeverity) return false
  const thresholdIndex = SEVERITIES.indexOf(severity)
  return SEVERITIES.some((level, index) => index <= thresholdIndex && Number(report.summary.bySeverity[level]) > 0)
}

function resolveRepoRoot(cwd = process.cwd()) {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf8' }).trim()
  } catch {
    return cwd
  }
}

export function runHook({ input = '', base, failOn = 'high', dryRun = false, cwd = process.cwd(), review = runReview } = {}) {
  if (!SEVERITIES.includes(failOn)) throw new Error(`--fail-on must be ${SEVERITIES.join(', ')}`)
  let event = {}
  if (input.trim()) {
    try {
      event = JSON.parse(input)
    } catch {
      throw new Error('Hook input must be valid JSON when provided.')
    }
  }

  const paths = extractHookPaths(event)
  if (paths.length && !shouldReviewPaths(paths)) {
    return {
      exitCode: 0,
      output: JSON.stringify({ status: 'skipped', reason: 'non-code-edit', paths }, null, 2),
      report: null,
    }
  }

  const args = buildReviewArgs({ base, failOn })
  if (dryRun) {
    return {
      exitCode: 0,
      output: JSON.stringify({ status: 'would-review', paths, args }, null, 2),
      report: null,
    }
  }

  const originalCwd = process.cwd()
  process.chdir(resolveRepoRoot(cwd))
  try {
    const result = review(args)
    const report = result.report || parseReport(result.output)
    const blocked = reportHasSeverity(report, failOn)
    return {
      ...result,
      exitCode: blocked ? 2 : result.exitCode,
      report,
    }
  } finally {
    process.chdir(originalCwd)
  }
}

function parseArgs(argv) {
  const options = { failOn: 'high', dryRun: false }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--base') options.base = argv[++index]
    else if (argument === '--fail-on') options.failOn = argv[++index] || options.failOn
    else if (argument === '--dry-run') options.dryRun = true
    else if (argument === '--event') index += 1
    else throw new Error(`Unknown option: ${argument}`)
  }
  return options
}

async function readStdin() {
  if (process.stdin.isTTY) return ''
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
if (isMain) {
  try {
    const options = parseArgs(process.argv.slice(2))
    const result = runHook({ ...options, input: await readStdin() })
    process.stdout.write(`${result.output}\n`)
    process.exitCode = result.exitCode
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}
