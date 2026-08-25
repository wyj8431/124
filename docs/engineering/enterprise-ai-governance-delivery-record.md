# AI Delivery Record: Enterprise AI Code Governance

## Scope

- Request: Make AI-assisted code changes conform to an auditable enterprise engineering standard, requiring the available `superpowers` workflow and an honest `claude-code-everything` integration status.
- In scope: Repository agent contracts, engineering standard, delivery record template, React test entry point, Vue admin build permission, shared local quality gate, high-risk PR evidence check, PR template, and GitHub Actions workflow.
- Explicitly out of scope: Product behavior, the main worktree's uncommitted collaboration feature, remote GitHub branch-protection administration, and installation of unavailable third-party plugins.

## Design Decisions

- Chosen approach and why: Enforce observable outcomes through repository instructions, test-first PowerShell controls, a shared CI/local quality gate, and recorded evidence. This produces reviewable controls independently of a contributor's AI client.
- Alternatives considered and rejected: Claiming `claude-code-everything` is installed or enforcing a client plugin that is absent. `CLAUDE.md` instead records that the plugin was not found and requires the same auditable gates.

## Changed Files and Risk Boundary

- Files: `AGENTS.md`, `CLAUDE.md`, `docs/engineering/*`, `docs/superpowers/*`, `frontend/package.json`, `frontend/test/package-scripts.test.mjs`, `admin-web/pnpm-workspace.yaml`, `scripts/*quality-gate*`, `scripts/*risk-evidence*`, `.github/pull_request_template.md`, and `.github/workflows/quality-gate.yml`.
- Risk classification: high. The change adds CI and repository governance controls.

## Verification

| Command | Result | Notes |
| --- | --- | --- |
| `pwsh -NoProfile -Command "Invoke-Pester scripts/test-quality-gate.Tests.ps1"` | PASS | 4 passed, 0 failed. Covers eight stages, named runtime preflights, missing-Node reporting, and multiple PATH candidates. |
| `pwsh -NoProfile -Command "Invoke-Pester scripts/test-check-risk-evidence.Tests.ps1"` | PASS | 4 passed, 0 failed. Covers incomplete and complete PR bodies, comment-only evidence rejection, and Git enumeration failure. |
| `pnpm --dir admin-web install --frozen-lockfile` | PASS | pnpm 11.3.0; the tracked `esbuild` permission enables installation. |
| `pnpm --dir admin-web run build` | PASS | Vite built successfully; it emitted a non-failing large-chunk warning. |
| `pwsh -NoProfile -File scripts/quality-gate.ps1` | FAIL | Stopped at React frontend tests: 5 passed, 1 failed because `frontend/src/types/team.ts` is absent from this isolated branch baseline. Remaining gate stages did not run by design. |

- Commit range: `718fa48..b50edb1`.
- Runtime versions: Node.js `v22.22.2`; npm `10.9.7`; pnpm `11.3.0`; Java `21.0.12`; Pester `3.4.0`.
- CI run or pull-request link: No remote CI run or pull request has been created from this local branch.
- Stage-level results: `git diff --check`, frontend `npm ci --ignore-scripts`, and frontend lint passed during the complete gate. Lint exited 0 with 9 existing warnings. Frontend tests failed for the isolated-branch baseline issue above; frontend build, admin-web, and Maven stages were therefore skipped in that run.

## Affected Cross-Layer Flow Evidence

- Flow: None. This change adds governance tooling and does not change login, design save, or collaboration behavior.
- Why this flow is affected: No product cross-layer flow is affected.
- Exact API or browser smoke-test command: Not run because no product flow changed.
- Environment and test data: Not applicable.
- Result and failure details: Not applicable.

## Residual Risk and Unverified Work

- External integrations not verified: GitHub Actions has not run remotely; remote default-branch protection, required reviewer policy, stale-approval dismissal, and bypass restrictions have not been inspected or configured in this local workspace.
- Follow-up risk: The full quality gate cannot pass until the missing collaboration type/API files from the main worktree are integrated through their own reviewed change. `claude-code-everything` remains unavailable and must not be represented as installed.

## High-Risk Evidence

- Threat surface and authorization impact: CI and repository instructions govern what can merge; a weak gate or fabricated PR evidence could allow unreviewed high-risk changes. The checker requires evidence content, rejects comment-only entries, and the standard requires remote branch protection.
- Data migration and compatibility window: No database schema or public API migration is included. The existing frontend/backend contracts are unchanged.
- Rollback procedure: Revert the governance commits from `cf0f61b` through `b50edb1` in reverse order after restoring the prior repository instructions and CI policy; do not delete delivery evidence.
- Regression test name and result: `quality-gate contract` passed 4/4; `check-risk-evidence` passed 4/4.
- Human reviewer and approval: Pending. This high-risk branch must not merge until a qualified human approves it.
- Reviewer identity: Not yet assigned.
- Review timestamp: Not yet available.
- Pull-request link or branch-protection approval result: No pull request has been created. Record the pull-request URL and the verified default-branch protection result before merge.
