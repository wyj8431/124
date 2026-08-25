import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const packageJson = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
)

test('exposes the canonical frontend test command', () => {
  assert.equal(packageJson.scripts.test, 'node --test test/*.test.mjs')
})
