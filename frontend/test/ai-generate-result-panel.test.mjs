import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const componentPath = new URL('../src/components/home/AiGenerateResultPanel.tsx', import.meta.url)
const componentSource = readFileSync(componentPath, 'utf8')

test('renders completed video results with a native player and keeps image results as images', () => {
  assert.match(
    componentSource,
    /\{isVideo \? \(\s*<video[\s\S]*?src=\{current\.outputUrl \?\? ''\}[\s\S]*?controls[\s\S]*?\) : \(\s*<img/,
  )
})
