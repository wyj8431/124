import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim()
}

export function installHooks(cwd = process.cwd()) {
  const repoRoot = git(['rev-parse', '--show-toplevel'], cwd)
  const hooksPath = path.join(repoRoot, '.githooks')
  for (const hookName of ['pre-commit', 'pre-push', 'post-commit']) {
    const hookPath = path.join(hooksPath, hookName)
    if (fs.existsSync(hookPath)) fs.chmodSync(hookPath, 0o755)
  }
  git(['config', '--local', 'core.hooksPath', '.githooks'], repoRoot)
  return { repoRoot, hooksPath }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
if (isMain) {
  try {
    const result = installHooks()
    process.stdout.write(`Installed code review hooks at ${result.hooksPath}\n`)
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}
