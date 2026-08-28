import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { analyzeFiles, reportToMarkdown } from './review-engine.mjs'

const SEVERITY_ORDER = ['high', 'medium', 'low', 'info']

// 工单编号：网站学院-All poster低代码开发平台--Cursor或者Trae配置代码审查Skills能力工单

function parseArgs(argv) {
  const options = { scope: 'changed-files', format: 'markdown', severityThreshold: 'info', maxFindings: 100, paths: [] }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--help' || argument === '-h') options.help = true
    else if (argument === '--scope') options.scope = argv[++index] || options.scope
    else if (argument === '--format') options.format = argv[++index] || options.format
    else if (argument === '--base') options.base = argv[++index]
    else if (argument === '--paths') options.paths = (argv[++index] || '').split(',').map((value) => value.trim()).filter(Boolean)
    else if (argument === '--severity') options.severityThreshold = argv[++index] || options.severityThreshold
    else if (argument === '--max') options.maxFindings = Number(argv[++index]) || options.maxFindings
    else if (argument === '--rules') options.rulesPath = argv[++index]
    else throw new Error(`Unknown option: ${argument}`)
  }
  if (!['markdown', 'json'].includes(options.format)) throw new Error('--format must be markdown or json')
  if (!['high', 'medium', 'low', 'info'].includes(options.severityThreshold)) throw new Error('--severity must be high, medium, low, or info')
  if (!['changed-files', 'component-standards', 'performance-issues', 'types-and-contracts'].includes(options.scope)) throw new Error(`Unknown scope: ${options.scope}`)
  return options
}

function git(rootDir, args) {
  return execFileSync('git', args, { cwd: rootDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

function resolveRoot() {
  try {
    return git(process.cwd(), ['rev-parse', '--show-toplevel']).trim()
  } catch {
    return process.cwd()
  }
}

function collectDiff(rootDir, options) {
  const pathArgs = options.paths.length ? ['--', ...options.paths] : ['--']
  const diffArgs = options.base ? ['diff', options.base, '--no-ext-diff', '--unified=80', ...pathArgs] : ['diff', 'HEAD', '--no-ext-diff', '--unified=80', ...pathArgs]
  let diff
  try {
    diff = git(rootDir, diffArgs)
  } catch {
    diff = git(rootDir, ['diff', '--no-ext-diff', '--unified=80', ...pathArgs])
  }
  let names
  try {
    names = git(rootDir, options.base ? ['diff', '--name-only', options.base, ...pathArgs] : ['diff', '--name-only', 'HEAD', ...pathArgs])
  } catch {
    names = git(rootDir, ['diff', '--name-only', ...pathArgs])
  }
  let untracked = ''
  try {
    untracked = git(rootDir, ['ls-files', '--others', '--exclude-standard', ...pathArgs])
  } catch {
    // A non-Git folder can still be reviewed through an explicit path list.
  }
  const changedPaths = names.split(/\r?\n/).map((value) => value.trim()).filter(Boolean)
  const untrackedPaths = untracked.split(/\r?\n/).map((value) => value.trim()).filter(Boolean)
  return { diff, paths: [...new Set([...changedPaths, ...untrackedPaths])] }
}

function collectAddedLines(diff) {
  const added = new Map()
  let currentFile = null
  let currentLine = 0
  for (const line of diff.split(/\r?\n/)) {
    const fileHeader = line.match(/^\+\+\+ b\/(.+)$/)
    if (fileHeader) {
      currentFile = fileHeader[1]
      if (!added.has(currentFile)) added.set(currentFile, new Set())
      continue
    }
    const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
    if (hunk) {
      currentLine = Number(hunk[1])
      continue
    }
    if (!currentFile || line.startsWith('+++') || line.startsWith('---')) continue
    if (line.startsWith('+')) added.get(currentFile).add(currentLine++)
    else if (!line.startsWith('-')) currentLine += 1
  }
  return added
}

function helpText() {
  return [
    'Code review adapter',
    'Usage: node cursor-skills/code-review/scripts/review-changed-files.mjs [options]',
    '  --scope changed-files|component-standards|performance-issues|types-and-contracts',
    '  --format markdown|json',
    '  --base <git-ref>  --paths <file,dir>  --severity high|medium|low|info  --max <n>  --rules <json>',
  ].join('\n')
}

function loadRuleConfig(rootDir, rulesPath) {
  const absolutePath = rulesPath ? path.resolve(rootDir, rulesPath) : path.join(rootDir, 'cursor-skills', 'code-review', 'rules.json')
  try {
    const config = JSON.parse(fs.readFileSync(absolutePath, 'utf8'))
    const rules = Array.isArray(config.rules) ? config.rules : []
    return {
      enabledRuleIds: new Set(rules.filter((rule) => rule.enabled !== false).map((rule) => rule.id)),
      ruleSeverities: Object.fromEntries(rules.filter((rule) => rule.id && rule.severity).map((rule) => [rule.id, rule.severity])),
      excludeDirectories: Array.isArray(config.defaults?.excludeDirectories) ? config.defaults.excludeDirectories : [],
    }
  } catch {
    return {}
  }
}

export function reviewExitCode(report, severityThreshold = 'high') {
  const blockingThreshold = severityThreshold === 'info' ? 'high' : severityThreshold
  const thresholdIndex = SEVERITY_ORDER.indexOf(blockingThreshold)
  if (thresholdIndex === -1) throw new Error(`Unknown severity threshold: ${severityThreshold}`)
  const counts = report?.summary?.bySeverity || {}
  return SEVERITY_ORDER.slice(0, thresholdIndex + 1).some((severity) => Number(counts[severity]) > 0) ? 2 : 0
}

export function run(argv = process.argv.slice(2)) {
  const options = parseArgs(argv)
  if (options.help) return { output: helpText(), exitCode: 0 }
  const rootDir = resolveRoot()
  const { diff, paths } = collectDiff(rootDir, options)
  const addedLines = collectAddedLines(diff)
  const files = paths.map((relativePath) => {
    const absolutePath = path.resolve(rootDir, relativePath)
    const content = fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf8') : ''
    const fileAddedLines = addedLines.get(relativePath)
    return {
      path: relativePath.replaceAll('\\', '/'),
      content,
      // Git does not emit a diff hunk for an untracked file; treat every line as added.
      addedLines: fileAddedLines || new Set(content.split(/\r?\n/).map((_, index) => index + 1)),
    }
  })
  const report = analyzeFiles(files, { ...options, ...loadRuleConfig(rootDir, options.rulesPath), rootDir })
  report.verification.commands = [`git diff ${options.base || 'HEAD'} -- ${options.paths.length ? options.paths.join(' ') : '.'}`]
  const output = options.format === 'json' ? JSON.stringify(report, null, 2) : reportToMarkdown(report)
  return { output, exitCode: reviewExitCode(report, options.severityThreshold), report }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
if (isMain) {
  try {
    const result = run()
    process.stdout.write(`${result.output}\n`)
    process.exitCode = result.exitCode
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}
