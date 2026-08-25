# AI-Assisted Engineering Standard

## Purpose and Scope

This standard applies to Codex, Claude Code, Cursor, Trae, and human contributors working on the React/Vite frontend, the separately owned Vue/Vite `admin-web` application, Spring Boot/MyBatis-Plus backend, database scripts, CI, and deployment configuration. The `admin-web` owner is responsible for keeping its checks and deployment evidence current.

## Required Workflow

1. State the requested behavior, non-goals, affected users, and acceptance criteria.
2. Read applicable skills and repository instructions.
3. For behavior or architecture changes, record the design and obtain confirmation before implementation.
4. Write or update a focused failing test before implementation when behavior is testable.
5. Implement the smallest compatible change.
6. Review the diff for scope, security, API/data compatibility, and generated files.
7. Run `pwsh -File scripts/quality-gate.ps1` and record the real output.
8. Complete the delivery record and obtain human review for high-risk changes.

## Expedited Emergency Fixes

For an active incident or production safety issue, an owner may use an expedited path: record the incident, affected users, smallest safe patch, and expedited human approval before deployment; run focused regression tests and the available quality gates before merge; and attach the evidence. The design decision, compatibility and rollback analysis, and any broader tests may be completed immediately after stabilization, but must be recorded within one business day before the follow-up change is closed. The delivery record must identify what remained after stabilization, why the exception was necessary, and the owner and due date for post-hoc evidence.

## Design and Boundaries

- Keep UI, API, service, persistence, and deployment responsibilities in their existing layers.
- Preserve public request/response shapes and database compatibility unless the approved design includes versioning or migration.
- Do not introduce a new framework, scanner, or service solely to satisfy an AI-generated suggestion.
- Prefer existing project utilities and dependencies; remove speculative abstractions.

## Security and Data

- Validate untrusted input at the boundary and enforce authorization server-side.
- Do not log tokens, passwords, personal data, or provider secrets.
- Do not commit `.env` files, credentials, generated build artifacts, logs, local databases, or uploads. Intentionally tracked generated SQL or data-migration files under the database migration path are allowed only when reviewed for compatibility and rollback; other generated output remains excluded.
- For schema or authentication changes, document migration order, compatibility window, threat surface, and rollback.

## Testing and Observability

- Frontend changes require TypeScript compilation, oxlint, Node regression tests, and a Vite production build.
- `admin-web` changes are in scope as a separately owned Vue/Vite application. Its current lockfile and scripts support `pnpm --dir admin-web install --frozen-lockfile` and `pnpm --dir admin-web build`; both are required for every `admin-web` change. It currently has no `lint` or `test` script, so a delivery record must state those checks are unavailable rather than imply they passed. When either script is added, the `admin-web` owner must add them to the shared gate and CI before deployment.
- Backend changes require the complete Maven test suite on Java 21.
- Database, authentication, authorization, transaction, upload, and payment behavior must cover success, rejection, and boundary paths.
- Main cross-layer flows (login, design save, collaboration comment/notification) require an API or browser smoke test when affected. Record the exact smoke-test command, environment, affected flow, and result in the delivery record.
- New failure paths must produce actionable logs/metrics without sensitive values.

## Risk Classification

Treat changes to `backend/**/security/**`, `backend/**/config/**`, `backend/**/controller/**`, authentication, permission, payment, or upload-related backend service classes, `backend/src/main/resources/db/**`, `frontend/src/api/**`, `frontend/src/context/AuthContext`, `frontend/src/.*(route|Route|router|Router|guard|Guard)`, `.github/**`, deployment files, and environment configuration as high risk. Other backend service changes are not automatically high risk unless their data, authorization, or cross-layer impact makes them high risk. High-risk delivery records must contain threat, compatibility/data migration, rollback, regression-test, and human-review evidence.

| Risk | Examples | Minimum evidence |
| --- | --- | --- |
| Low | Isolated copy, styling, or documentation changes with no contract impact | Focused verification and changed-file scope |
| Medium | Non-sensitive feature behavior or internal refactoring across one layer | Design decision, regression tests, verification results, and residual risk |
| High | Security/config/controller paths, auth/permission/payment/upload services, database migrations, API/route guards, CI, deployment, or environment changes | Threat, compatibility/migration, rollback, regression-test, and human-review evidence |

## Quality Gates

The only local entry point is `scripts/quality-gate.ps1`. It runs `git diff --check`, frontend dependency installation, frontend lint, frontend tests, frontend build, and backend Maven tests in that order. For any `admin-web` change, the `admin-web` owner must also run `pnpm --dir admin-web install --frozen-lockfile` and `pnpm --dir admin-web build`; until those stages are wired into the shared script, the delivery record must include their real results separately. Before deployment, the CI owner must ensure those `admin-web` stages are enforced in CI. When `admin-web` lint or test scripts are introduced, the owner must add them to the gate and retain their output. Any failure returns a non-zero exit code and retains the original command output. The script never auto-fixes code, deletes user files, or modifies database source files.

GitHub Actions invokes the same script on pushes and pull requests. Pull requests that touch high-risk paths must also satisfy the evidence check and receive human approval.

## Delivery Checklist

- Scope and non-goals are stated.
- Design decisions and rejected alternatives are recorded.
- Changed files and risk boundary are listed.
- Exact verification commands and real results are recorded.
- Runtime versions, commit SHA, CI or PR link, and stage-level results are recorded.
- Unverified integrations and residual risks are listed.
- High-risk changes include threat, compatibility/migration, rollback, regression-test, and human-review evidence.
- Human review evidence identifies the reviewer, timestamp, PR link or branch-protection result.
