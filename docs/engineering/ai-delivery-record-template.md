# AI Delivery Record

## Scope

- Request:
- In scope:
- Explicitly out of scope:

## Design Decisions

- Chosen approach and why:
- Alternatives considered and rejected:

## Changed Files and Risk Boundary

- Files:
- Risk classification: low / medium / high

## Verification

| Command | Result | Notes |
| --- | --- | --- |
| `pwsh -File scripts/quality-gate.ps1` | PASS/FAIL | |
| `pnpm --dir admin-web install --frozen-lockfile` (when affected) | PASS/FAIL/NOT RUN | |
| `pnpm --dir admin-web build` (when affected) | PASS/FAIL/NOT RUN | |
| API or browser smoke test (when an affected cross-layer flow exists) | PASS/FAIL/NOT RUN | Include the exact command and environment. |

- Commit SHA:
- Runtime versions (Node, Java, Maven, and relevant tool versions):
- CI run or pull-request link:
- Stage-level results (diff check, dependency install, lint, unit/regression tests, build, backend tests, smoke test):

## Affected Cross-Layer Flow Evidence

- Flow (login, design save, collaboration comment/notification, or other):
- Why this flow is affected:
- Exact API or browser smoke-test command:
- Environment and test data:
- Result and failure details:

## Residual Risk and Unverified Work

- External integrations not verified:
- Follow-up risk:

## Expedited Emergency Fix Evidence (required when the emergency path is used)

- Incident and user impact:
- Smallest safe patch and approval before deployment:
- Focused regression tests and results:
- Post-hoc design and compatibility analysis:
- Rollback procedure:
- Human approver and evidence location:
- Owner and due date for remaining evidence:

## High-Risk Evidence (required when risk is high)

- Threat surface and authorization impact:
- Data migration and compatibility window:
- Rollback procedure:
- Regression test name and result:
- Human reviewer and approval:
- Reviewer identity:
- Review timestamp:
- Pull-request link or branch-protection approval result:
