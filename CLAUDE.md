# Claude Code Repository Contract

This file is the Claude Code-compatible entry point for the repository. It mirrors `AGENTS.md`; both files are normative and must stay consistent.

## Skills, MCP, and Agents

Before starting any coding, debugging, testing, design, document, or infrastructure task, proactively discover the installed skills and read every skill that matches the task. Follow the selected skill instructions throughout the task.

Use available MCP tools proactively when they provide a direct capability for the task. Prefer browser or Playwright MCP for page inspection and visual verification, use the relevant design MCP for design-source work, and use file, database, or service MCP tools when they are the authoritative integration path.

Use sub-agents proactively only when the task has independent, bounded parts that can be completed safely in parallel. Do not delegate overlapping file edits. Keep ownership and verification explicit, then review the combined result before declaring completion.

## Before Work

- Read the repository guidance and the relevant installed skills before changing code.
- Every multi-step task, including features, refactors, documentation, and infrastructure work, must leave a design document under `docs/superpowers/specs/` and an implementation plan under `docs/superpowers/plans/` before implementation.
- For every multi-step task, including features, refactors, documentation, and infrastructure work, follow this sequence: `superpowers:brainstorming` -> user confirmation -> `superpowers:writing-plans`.
- Treat the approved plan and the user's latest request as the source of truth. Do not infer unrelated scope.

## Implementation Contract

- Use `superpowers:test-driven-development` before implementation for behavior changes and test changes; keep the smallest useful failing test, implementation, and regression coverage.
- Make minimal, reversible changes. Preserve existing user changes, repository conventions, public contracts, and data. Never reset or overwrite unrelated work.
- Keep secrets, credentials, generated artifacts, and machine-local files out of commits. Use existing APIs, helpers, and dependency versions before introducing new abstractions.
- High-risk changes (authentication, authorization, payments, data migrations, destructive operations, security boundaries, or shared infrastructure) require regression tests, a concise risk note, and explicit human review evidence in the delivery record.

## Verification Contract

- Before completion, use `superpowers:verification-before-completion` and run the repository quality gate:

  `pwsh -File scripts/quality-gate.ps1`

- Report the exact commands and results, including any skipped check and why. Do not claim completion from inspection alone.
- Every delivery must include or update `docs/engineering/ai-code-standard.md` when the standard is affected, plus a delivery record covering scope, risks, tests, and review evidence.
- `superpowers` is available in this environment. `claude-code-everything` was not found, so this repository does not claim that plugin is installed or invoked; compliance is enforced through these auditable rules and quality-gate results.

## Collaboration

- Use `superpowers:subagent-driven-development` for approved multi-step plans when independent tasks can be isolated; otherwise use `superpowers:executing-plans` inline.
- Assign clear file ownership to sub-agents, review their changes, and run the full quality gate after integration.
- Keep commits focused and auditable; do not mix governance work with unrelated product changes.
