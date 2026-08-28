import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const rootUrl = new URL('../../../', import.meta.url)

test('Codex review skill is configured for implicit completion-time invocation', async () => {
  const [skill, agentConfig, agents, runner] = await Promise.all([
    readFile(new URL('.codex/skills/code-review/SKILL.md', rootUrl), 'utf8'),
    readFile(new URL('.codex/skills/code-review/agents/openai.yaml', rootUrl), 'utf8'),
    readFile(new URL('AGENTS.md', rootUrl), 'utf8'),
    readFile(new URL('scripts/codex-code-review.mjs', rootUrl), 'utf8'),
  ])

  assert.match(skill, /Codex 代码审查 Skill/)
  assert.match(skill, /代码变更.*Codex 必须.*运行一次.*审查/s)
  assert.match(skill, /scripts\/codex-code-review\.mjs --scope changed-files --format json/)
  assert.match(agentConfig, /allow_implicit_invocation: true/)
  assert.match(agents, /node scripts\/codex-code-review\.mjs --scope changed-files --format json/)
  assert.match(runner, /review-changed-files\.mjs/)
})
