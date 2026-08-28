import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { installHooks } from './install-code-review-hooks.mjs'

test('installs the repository-local Git hooks path', async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'chuangkit-hooks-'))
  try {
    await writeFile(path.join(tempRoot, '.gitkeep'), '')
    execFileSync('git', ['init'], { cwd: tempRoot, stdio: 'ignore' })
    const result = installHooks(tempRoot)

    assert.equal(await realpath(result.repoRoot), await realpath(tempRoot))
    assert.equal(await realpath(path.dirname(result.hooksPath)), await realpath(tempRoot))
    assert.equal(path.basename(result.hooksPath), '.githooks')
    assert.equal(execFileSync('git', ['config', '--local', '--get', 'core.hooksPath'], {
      cwd: tempRoot,
      encoding: 'utf8',
    }).trim(), '.githooks')
  } finally {
    await rm(tempRoot, { recursive: true, force: true })
  }
})

test('ships a blocking pre-push quality gate hook', async () => {
  const hook = await readFile(new URL('../.githooks/pre-push', import.meta.url), 'utf8')

  assert.match(hook, /scripts\/quality-gate\.ps1/)
  assert.match(hook, /ReviewBaseRef/)
  assert.doesNotMatch(hook, /\|\|\s*true/)
})
