import assert from 'node:assert/strict'
import test from 'node:test'

import { run } from './codex-code-review.mjs'
import { reviewExitCode } from '../cursor-skills/code-review/scripts/review-changed-files.mjs'

test('Codex review adapter exposes the changed-file runner', () => {
  assert.equal(typeof run, 'function')
})

test('review exit code blocks the configured severity threshold', () => {
  const report = { summary: { bySeverity: { high: 0, medium: 1, low: 0, info: 0 } } }
  assert.equal(reviewExitCode(report, 'medium'), 2)
  assert.equal(reviewExitCode(report, 'high'), 0)
  assert.equal(reviewExitCode({ summary: { bySeverity: { high: 0, medium: 0, low: 0, info: 1 } } }, 'info'), 0)
})
