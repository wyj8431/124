import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { analyzeFiles, reportToMarkdown } from '../scripts/review-engine.mjs'

// 工单编号：网站学院-All poster低代码开发平台--Cursor或者Trae配置代码审查Skills能力工单

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

test('reports cross-file import, type, and performance findings', () => {
  const report = analyzeFiles([
    {
      path: 'frontend/src/ReviewFixture.tsx',
      content: [
        "import { Missing } from './missing-module'",
        'export function ReviewFixture() {',
        '  const payload: any = { ok: true }',
        '  useEffect(() => { console.log(payload) })',
        '  return <Missing />',
        '}',
      ].join('\n'),
    },
  ], { rootDir: projectRoot, severityThreshold: 'info' })

  assert.equal(report.schemaVersion, '1.0')
  assert.ok(report.findings.some((finding) => finding.id === 'correctness/missing-local-import'))
  assert.ok(report.findings.some((finding) => finding.id === 'types/no-explicit-any'))
  assert.ok(report.findings.some((finding) => finding.id === 'performance/effect-dependencies'))
  assert.ok(report.findings.every((finding) => Number.isInteger(finding.line) && finding.line > 0))
})

test('scope and severity parameters reduce the result set without changing the report contract', () => {
  const report = analyzeFiles([
    { path: 'frontend/src/ReviewFixture.tsx', content: 'export default function reviewFixture() { return <div /> }' },
  ], { rootDir: projectRoot, scope: 'component-standards', severityThreshold: 'low' })

  assert.equal(report.scope, 'component-standards')
  assert.ok(report.findings.every((finding) => finding.category === 'component-standards'))
  assert.equal(report.summary.bySeverity.medium, 0)
  assert.match(reportToMarkdown(report), /Code Review Report/)
})

test('an empty input is a valid no-findings result', () => {
  const report = analyzeFiles([], { rootDir: projectRoot })
  assert.equal(report.summary.total, 0)
  assert.match(reportToMarkdown(report), /No actionable findings/)
})

test('rule configuration can disable a finding before severity filtering', () => {
  const report = analyzeFiles([
    { path: 'frontend/src/ReviewFixture.tsx', content: 'const payload: any = {}' },
  ], { rootDir: projectRoot, enabledRuleIds: new Set() })
  assert.equal(report.summary.total, 0)
})

test('test fixtures are not linted as production source', () => {
  const report = analyzeFiles([
    {
      path: 'cursor-skills/code-review/test/review-fixture.test.mjs',
      content: [
        "import { Missing } from './missing-module'",
        "const payload = 'const value: any = {}'",
        "const effect = 'useEffect(() => { console.log(payload) })'",
      ].join('\n'),
    },
  ], { rootDir: projectRoot, severityThreshold: 'info' })

  assert.equal(report.summary.total, 0)
})

test('review rule implementations are not linted by their own content rules', () => {
  const report = analyzeFiles([
    {
      path: 'cursor-skills/code-review/scripts/review-engine.mjs',
      content: "const explicitAny = /:\\s*any\\b|<any>|\\bany\\[\\]/.test(text)",
    },
  ], { rootDir: projectRoot, severityThreshold: 'info' })

  assert.equal(report.summary.total, 0)
})

test('skips generated vendor assets in configured excluded directories', () => {
  const report = analyzeFiles([
    {
      path: 'frontend/public/models/selfie-segmentation/generated-wrapper.js',
      content: "const loadGeneratedAsset = import('+oldSize+')",
    },
  ], {
    rootDir: projectRoot,
    severityThreshold: 'info',
    excludeDirectories: ['frontend/public/models'],
  })

  assert.equal(report.summary.total, 0)
})

test('effect dependency scans tolerate long effect bodies before a valid dependency array', () => {
  const report = analyzeFiles([
    {
      path: 'frontend/src/LongEffectFixture.tsx',
      content: [
        'import { useEffect } from "react"',
        'export function LongEffectFixture({ enabled }) {',
        '  useEffect(() => {',
        `    const payload = "${'x'.repeat(900)}"`,
        '    if (enabled) console.log(payload)',
        '  }, [enabled])',
        '  return null',
        '}',
      ].join('\n'),
    },
  ], { rootDir: projectRoot, severityThreshold: 'info' })

  assert.equal(report.findings.some((finding) => finding.id === 'performance/effect-dependencies'), false)
})
