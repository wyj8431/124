# Codex 企业级 AI 代码门禁交付记录

## Scope

- Request: 在 Codex 中形成可执行的企业级 AI 代码治理闭环。
- In scope: Superpowers 仓库规则、Codex 原生代码审查、统一质量门禁、GitHub Actions、高风险证据校验和审查器回归夹具隔离。
- Out of scope: 业务功能改动、生产部署凭据、Cursor/Trae hooks，以及未安装的 `claude-code-everything` 插件。

## Design Decisions

- `scripts/quality-gate.ps1` 是本地与 CI 的唯一质量入口，并在运行时预检前执行 Codex changed-files 审查。
- `.githooks/pre-commit` 阻断 high/medium 审查问题，`.githooks/pre-push` 在推送前运行完整质量门禁；两者都由 `npm run hooks:install` 安装到本地仓库。
- `scripts/codex-code-review.mjs` 保留为 Codex 入口；审查引擎、规则和测试作为其运行时依赖纳入仓库。
- 测试文件和审查规则实现目录不参与生产内容规则扫描，避免“故意坏代码”测试夹具和规则正则阻塞自身门禁；测试仍由 Node/Vite/Maven 执行。
- `claude-code-everything` 当前未安装。仓库规则明确记录不可用状态，不伪造插件调用；Codex 通过 Superpowers 规则、审查结果和质量门禁强制结果。

## Changed Files and Risk Boundary

- Governance files: `AGENTS.md`, `CLAUDE.md`, `docs/engineering/**`, `scripts/quality-gate.ps1`, `scripts/check-risk-evidence.ps1`, `.github/**`.
- Review runtime: `cursor-skills/code-review/rules.json`, `cursor-skills/code-review/scripts/**`, `cursor-skills/code-review/test/review-engine.test.mjs`.
- Risk classification: high, because CI and review enforcement changed.

## Verification

| Command | Result | Notes |
| --- | --- | --- |
| `pwsh -NoProfile -Command "Invoke-Pester -Path scripts -EnableExit"` | PASS | 7/7 contract tests passed. |
| `node --test cursor-skills/code-review/test/codex-integration.test.mjs cursor-skills/code-review/test/review-engine.test.mjs` | PASS | Codex integration and review-engine tests passed, including fixture isolation. |
| `node scripts/codex-code-review.mjs --scope changed-files --format json --paths ...` | PASS | Focused governance/review files: 0 findings. |
| `npm run test` in `frontend` | PASS | 38 tests passed. |
| `npm run lint` in `frontend` | PASS | Exit code 0; existing warnings only. |
| `npm run build` in `frontend` | PASS | Vite production build completed. |
| `pnpm install --frozen-lockfile` in `admin-web` | PASS | pnpm 11.3.0, lockfile unchanged. |
| `pnpm run build` in `admin-web` | PASS | Production build completed. |
| `pwsh -NoProfile -File scripts/quality-gate.ps1` in the active worktree | ENVIRONMENTAL BLOCK | Codex review, runtime preflight, governance tests, frontend lint/tests/build, admin-web build, and backend tests are available; the dependency-install stage can hit Windows `EPERM` when an active Vite process holds `lightningcss.win32-x64-msvc.node`. |
| `node scripts/codex-code-review.mjs --scope changed-files --format json` | PASS | Final independent review returned exit code 0 with `high=0`, `medium=0`, `low=0`, and `info=32`. |
| `node --test scripts/install-code-review-hooks.test.mjs` | PASS | Hook installer and blocking pre-push contract: 2/2 tests passed. |
| `npm run hooks:install` in `frontend` | PASS | Local `core.hooksPath` is `.githooks`; pre-commit, pre-push, and post-commit hooks are installed. |
| `D:\Git\bin\sh.exe .githooks/pre-push` | PASS | Real pre-push execution ran the shared gate with `medium` threshold and ended with `QUALITY GATE PASSED`. |
| `$env:JAVA_HOME='D:\Program Files\Java\jdk-21.0.12'; .\mvnw.cmd -q test` in `backend` | PASS | Backend Maven suite passed with Java 21. |

## High-Risk Evidence

- Threat surface and authorization impact: CI and review failures can block delivery; no runtime authorization or data contract changed.
- Compatibility or migration impact: no database or API migration; quality scripts use existing Node, pnpm, Java 21, Maven, and npm lockfiles.
- Rollback procedure: revert the focused governance commit; business files remain unstaged and unaffected.
- Regression test name and result: `test fixtures are not linted as production source` and `review rule implementations are not linted by their own content rules`, both PASS.
- Human reviewer and approval: user confirmed the Codex-native closure design in the Codex task on 2026-08-25.
- Reviewer identity: Codex task owner (user confirmation recorded in conversation); repository branch protection approval remains required before merge.
- Review timestamp: 2026-08-25 Asia/Shanghai, recorded during this delivery.
- Pull-request link or branch-protection approval result: no remote pull request was created in this task; configure required quality-gate and human-approval checks in repository branch protection.

## Residual Risk

- The local gate depends on stopping any active project Vite process before `npm ci` replaces the Windows-native `lightningcss` module; the verified run passed after releasing that lock. CI runners are clean and do not share that file lock.
- GitHub `main` is protected. The required `quality` check is strict, one pull-request approval is required, administrator bypass is disabled, conversation resolution is required, force-pushes and deletions are disabled.
- `claude-code-everything` remains unavailable in Codex; installing it later is optional and cannot override the repository's Superpowers, review, or quality-gate requirements.
