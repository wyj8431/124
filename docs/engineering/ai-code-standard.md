# AI-Assisted Engineering Standard

## Purpose and Scope

This standard applies to Codex, Claude Code, Cursor, Trae, and human contributors working on the React/Vite frontend, Spring Boot/MyBatis-Plus backend, database scripts, CI, and deployment configuration.

## Required Workflow

1. State the requested behavior, non-goals, affected users, and acceptance criteria.
2. Read applicable skills and repository instructions.
3. For behavior or architecture changes, record the design and obtain confirmation before implementation.
4. Write or update a focused failing test before implementation when behavior is testable.
5. Implement the smallest compatible change.
6. Review the diff for scope, security, API/data compatibility, and generated files.
7. Run `pwsh -File scripts/quality-gate.ps1` and record the real output.
8. Complete the delivery record and obtain human review for high-risk changes.

## Design and Boundaries

- Keep UI, API, service, persistence, and deployment responsibilities in their existing layers.
- Preserve public request/response shapes and database compatibility unless the approved design includes versioning or migration.
- Do not introduce a new framework, scanner, or service solely to satisfy an AI-generated suggestion.
- Prefer existing project utilities and dependencies; remove speculative abstractions.

## Security and Data

- Validate untrusted input at the boundary and enforce authorization server-side.
- Do not log tokens, passwords, personal data, or provider secrets.
- Do not commit `.env` files, credentials, generated artifacts, logs, local databases, or uploads.
- For schema or authentication changes, document migration order, compatibility window, threat surface, and rollback.

## Testing and Observability

- Frontend changes require TypeScript compilation, oxlint, Node regression tests, and a Vite production build.
- Backend changes require the complete Maven test suite on Java 21.
- Database, authentication, authorization, transaction, upload, and payment behavior must cover success, rejection, and boundary paths.
- Main cross-layer flows (login, design save, collaboration comment/notification) require an API or browser smoke test when affected.
- New failure paths must produce actionable logs/metrics without sensitive values.

## Risk Classification

Treat changes to `backend/**/security/**`, `backend/**/config/**`, `backend/**/controller/**`, `backend/**/service/**`, `backend/src/main/resources/db/**`, `frontend/src/api/**`, `frontend/src/context/AuthContext`, `frontend/src/.*(route|Route|router|Router|guard|Guard)`, `.github/**`, deployment files, and environment configuration as high risk. High-risk delivery records must contain threat, compatibility/data migration, rollback, regression-test, and human-review evidence.

## Quality Gates

The only local entry point is `scripts/quality-gate.ps1`. It runs `git diff --check`, frontend dependency installation, frontend lint, frontend tests, frontend build, and backend Maven tests in that order. Any failure returns a non-zero exit code and retains the original command output. The script never auto-fixes code, deletes user files, or modifies database source files.

GitHub Actions invokes the same script on pushes and pull requests. Pull requests that touch high-risk paths must also satisfy the evidence check and receive human approval.

## Delivery Checklist

- Scope and non-goals are stated.
- Design decisions and rejected alternatives are recorded.
- Changed files and risk boundary are listed.
- Exact verification commands and real results are recorded.
- Unverified integrations and residual risks are listed.
- High-risk changes include threat, compatibility/migration, rollback, regression-test, and human-review evidence.
