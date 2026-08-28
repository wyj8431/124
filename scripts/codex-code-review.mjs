import { run } from '../cursor-skills/code-review/scripts/review-changed-files.mjs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export { run }

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
if (isMain) {
  try {
    const result = run(process.argv.slice(2))
    process.stdout.write(`${result.output}\n`)
    process.exitCode = result.exitCode
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}
