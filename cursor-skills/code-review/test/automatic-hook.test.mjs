import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  buildReviewArgs,
  extractHookPaths,
  runHook,
  shouldReviewPaths,
} from '../../../scripts/codex-code-review-hook.mjs'

const rootUrl = new URL('../../../', import.meta.url)

test('after-file-edit hook reviews source files and ignores non-code files', () => {
  assert.equal(shouldReviewPaths(['frontend/src/pages/HomePage.tsx']), true)
  assert.equal(shouldReviewPaths(['docs/README.md', 'frontend/public/logo.svg']), false)
  assert.equal(shouldReviewPaths([]), true)
})

test('hook payload paths support editor event shapes', () => {
  assert.deepEqual(extractHookPaths({ file_path: 'frontend/src/App.tsx' }), ['frontend/src/App.tsx'])
  assert.deepEqual(extractHookPaths({ filePath: 'frontend/src/App.tsx', paths: ['backend/src/main/App.java'] }), [
    'frontend/src/App.tsx',
    'backend/src/main/App.java',
  ])
})

test('review hook forwards an optional commit base and medium failure threshold', () => {
  assert.deepEqual(buildReviewArgs({ base: 'HEAD^', failOn: 'medium' }), [
    '--scope',
    'changed-files',
    '--format',
    'json',
    '--base',
    'HEAD^',
    '--severity',
    'medium',
  ])
})

test('hook blocks configured risk levels while preserving the shared report', () => {
  let receivedArgs = []
  const result = runHook({
    input: JSON.stringify({ filePath: 'frontend/src/App.tsx' }),
    failOn: 'medium',
    review: (args) => {
      receivedArgs = args
      return {
        exitCode: 0,
        output: JSON.stringify({ summary: { bySeverity: { high: 0, medium: 1, low: 0, info: 0 } } }),
      }
    },
  })

  assert.deepEqual(receivedArgs, ['--scope', 'changed-files', '--format', 'json', '--severity', 'medium'])
  assert.equal(result.exitCode, 2)
  assert.equal(result.report.summary.bySeverity.medium, 1)
})

test('editor and git hook configuration invoke the shared runner', async () => {
  const [cursorHooks, traeHooks, gitHook] = await Promise.all([
    readFile(new URL('.cursor/hooks.json', rootUrl), 'utf8'),
    readFile(new URL('.trae/hooks.json', rootUrl), 'utf8'),
    readFile(new URL('.githooks/pre-commit', rootUrl), 'utf8'),
  ])

  for (const hooks of [JSON.parse(cursorHooks), JSON.parse(traeHooks)]) {
    assert.equal(hooks.version, 1)
    assert.match(JSON.stringify(hooks.hooks.afterFileEdit), /scripts\/codex-code-review-hook\.mjs/)
  }
  assert.match(gitHook, /scripts\/codex-code-review-hook\.mjs --fail-on medium/)
})
