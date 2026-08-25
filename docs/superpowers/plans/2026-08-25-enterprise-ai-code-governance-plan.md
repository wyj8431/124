# Enterprise AI Code Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an auditable, model-independent AI coding workflow and enforce the repository's frontend, backend, and high-risk change quality gates locally and in GitHub Actions.

**Architecture:** Repository instructions provide one workflow for Codex and Claude Code, while a standards document defines the human-facing engineering contract. A single PowerShell command runs the deterministic local checks; GitHub Actions invokes that same command and adds a pull-request evidence check for high-risk files.

**Tech Stack:** Markdown repository rules, PowerShell 7, Node.js test runner, npm lockfile, oxlint, Vite/TypeScript, Java 21, Maven Wrapper, GitHub Actions.

---

## File Map

- Modify `AGENTS.md`: strengthen repository-wide AI workflow, scope, safety, and verification rules without changing product behavior.
- Create `CLAUDE.md`: Claude Code-compatible entry point that points to the same rules and requires the `superpowers` workflow; explicitly state that `claude-code-everything` is not installed in this workspace.
- Create `docs/engineering/ai-code-standard.md`: complete engineering standard, delivery record requirements, risk classification, testing, security, observability, and review checklist.
- Create `docs/engineering/ai-delivery-record-template.md`: copyable evidence template for every non-trivial AI-assisted change.
- Modify `frontend/package.json`: add the canonical Node test command while preserving existing scripts and dependency versions.
- Create `scripts/quality-gate.ps1`: deterministic local gate that runs the six required checks in order and exits non-zero on the first failure.
- Create `scripts/check-risk-evidence.ps1`: detects high-risk files and validates the required sections in a pull-request body; supports local changed-file inspection without requiring GitHub metadata.
- Create `.github/pull_request_template.md`: requires scope, design, risk, verification, and human-review evidence.
- Create `.github/workflows/quality-gate.yml`: runs Node and Java 21 setup, the shared local gate, and high-risk PR evidence validation on push and pull request events.

### Task 1: Align repository agent instructions

**Files:**
- Modify: `AGENTS.md`
- Create: `CLAUDE.md`

- [ ] **Step 1: Replace `AGENTS.md` with the approved repository contract**

Keep the existing requirement to discover applicable skills, MCP servers, and bounded sub-agents. Add these concrete rules:

```markdown
# Agent Working Rules

## Before Work

- Read the applicable skills before coding, debugging, testing, design, documentation, or infrastructure work.
- For a behavior or architecture change, complete `superpowers:brainstorming` and obtain confirmation before implementation.
- For a multi-step change, save a design under `docs/superpowers/specs/` and an implementation plan under `docs/superpowers/plans/`.
- Use `superpowers:test-driven-development` for behavior changes and `superpowers:verification-before-completion` before claiming completion.

## Implementation Contract

- Keep changes minimal and within the requested files; do not mix unrelated refactors.
- Preserve existing frontend, backend, API, database, and authentication contracts unless the approved design explicitly changes them.
- Never bypass, weaken, hide, or delete a failing test or quality gate.
- Never commit secrets, generated output, logs, local databases, or temporary files.
- High-risk changes (security, config, controllers, relevant services, database scripts, auth/API/routing, deployment, or CI) require a regression test, threat/compatibility notes, rollback notes, and human review evidence.

## Verification Contract

- Run `pwsh -File scripts/quality-gate.ps1` from the repository root before completion.
- Report the exact commands and real pass/fail results; do not claim success from inspection alone.
- If an external service is unavailable, use an explicitly named mock only for tests and record the unverified integration as residual risk.
- Stop and ask for human review when a possible secret or unsafe destructive operation is discovered.

## Collaboration

Use sub-agents only for independent, bounded work with explicit file ownership. Review their changes and run the shared quality gate before completion.
```

- [ ] **Step 2: Add `CLAUDE.md` as a compatible, non-misleading entry point**

Create the file with this content:

```markdown
# Claude Code Repository Contract

This file mirrors `AGENTS.md` for Claude Code-compatible agents. `AGENTS.md` is the source of the repository rules; read both when available.

Required workflow for non-trivial changes:

`superpowers:brainstorming` -> user confirmation -> `superpowers:writing-plans` -> `superpowers:test-driven-development` -> implementation -> `superpowers:verification-before-completion`

The repository enforces outcomes, not unverifiable plugin claims. `superpowers` is available in the configured Codex skills. `claude-code-everything` was not found in this workspace, so this file does not claim that it is installed or invoked. If it is installed later, its instructions must still obey the user's request, `AGENTS.md`, the approved design, and the quality gates.

Before completion, run:

```powershell
pwsh -File scripts/quality-gate.ps1
```

Follow `docs/engineering/ai-code-standard.md` and attach an AI delivery record for every non-trivial change. High-risk changes additionally require threat, compatibility, rollback, regression-test, and human-review evidence.
```

- [ ] **Step 3: Verify instruction consistency**

Run:

```powershell
rg -n "superpowers|quality-gate|claude-code-everything|high-risk|delivery record" AGENTS.md CLAUDE.md
```

Expected: both files mention the shared workflow, the quality gate, high-risk evidence, and the truthful unavailable-plugin statement; no file says that `claude-code-everything` is installed.

- [ ] **Step 4: Commit the instruction files**

```powershell
git add AGENTS.md CLAUDE.md
git commit -m "chore: define AI repository workflow"
```

Expected: only `AGENTS.md` and `CLAUDE.md` are included in the commit.

### Task 2: Publish the engineering standard and delivery evidence template

**Files:**
- Create: `docs/engineering/ai-code-standard.md`
- Create: `docs/engineering/ai-delivery-record-template.md`

- [ ] **Step 1: Write the standard with enforceable sections**

Create `docs/engineering/ai-code-standard.md` with these sections and requirements:

```markdown
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

Treat changes to `backend/**/security/**`, `backend/**/config/**`, `backend/**/controller/**`, `backend/**/service/**`, `backend/src/main/resources/db/**`, `frontend/src/api/**`, authentication context or route guards, `.github/**`, deployment files, and environment configuration as high risk. High-risk delivery records must contain threat, compatibility/data migration, rollback, regression-test, and human-review evidence.

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
```

- [ ] **Step 2: Add the copyable delivery record template**

Create `docs/engineering/ai-delivery-record-template.md`:

```markdown
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

## Residual Risk and Unverified Work

- External integrations not verified:
- Follow-up risk:

## High-Risk Evidence (required when risk is high)

- Threat surface and authorization impact:
- Data migration and compatibility window:
- Rollback procedure:
- Regression test name and result:
- Human reviewer and approval:
```

- [ ] **Step 3: Validate the documents and commit them**

Run:

```powershell
rg -n "deferred|placeholder|fill in details" docs/engineering/ai-code-standard.md docs/engineering/ai-delivery-record-template.md
```

Expected: no matches.

```powershell
git add docs/engineering/ai-code-standard.md docs/engineering/ai-delivery-record-template.md
git commit -m "docs: publish AI engineering standard"
```

Expected: only the two engineering documents are included.

### Task 3: Add the canonical frontend test command

**Files:**
- Modify: `frontend/package.json` (scripts object)

- [ ] **Step 1: Add the test script without changing dependencies**

Change the scripts object to include:

```json
"test": "node --test test"
```

Keep `dev`, `build`, `lint`, `sync:calendar`, and `preview` unchanged.

- [ ] **Step 2: Run frontend tests and build**

```powershell
Push-Location frontend
npm run test
npm run lint
npm run build
Pop-Location
```

Expected: Node reports all discovered tests passing, oxlint exits 0, and Vite produces `frontend/dist/`.

- [ ] **Step 3: Commit the package script**

```powershell
git add frontend/package.json
git commit -m "test: add canonical frontend test script"
```

Expected: `frontend/package-lock.json` is unchanged because no dependency is added.

### Task 4: Implement the shared local quality gate

**Files:**
- Create: `scripts/quality-gate.ps1`

- [ ] **Step 1: Implement stage execution and failure propagation**

Create the script with this behavior:

```powershell
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot

function Invoke-GateStage {
    param([string]$Name, [scriptblock]$Command)
    Write-Host "`n=== $Name ===" -ForegroundColor Cyan
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "Quality gate failed in '$Name' with exit code $LASTEXITCODE."
    }
}

function Invoke-Native {
    param([string]$Name, [string]$File, [string[]]$Arguments, [string]$WorkingDirectory)
    Invoke-GateStage -Name $Name -Command {
        Push-Location $WorkingDirectory
        try { & $File @Arguments }
        finally { Pop-Location }
    }
}

Push-Location $repoRoot
try {
    Invoke-Native 'Whitespace check' 'git' @('diff', '--check') $repoRoot

    $nodeVersion = (& node --version 2>&1 | Out-String).Trim()
    if ($LASTEXITCODE -ne 0) { throw 'Node.js is required; install a supported Node.js release.' }
    Write-Host "Node.js: $nodeVersion"

    $javaVersion = (& java -version 2>&1 | Out-String).Trim()
    if ($LASTEXITCODE -ne 0 -or $javaVersion -notmatch 'version "21') {
        throw "Java 21 is required. Detected: $javaVersion"
    }
    Write-Host "Java: $javaVersion"

    Invoke-Native 'Frontend dependencies' 'npm' @('ci', '--ignore-scripts') (Join-Path $repoRoot 'frontend')
    Invoke-Native 'Frontend lint' 'npm' @('run', 'lint') (Join-Path $repoRoot 'frontend')
    Invoke-Native 'Frontend tests' 'npm' @('run', 'test') (Join-Path $repoRoot 'frontend')
    Invoke-Native 'Frontend build' 'npm' @('run', 'build') (Join-Path $repoRoot 'frontend')
    Invoke-Native 'Backend Maven tests' '.\mvnw.cmd' @('-q', 'test') (Join-Path $repoRoot 'backend')
    Write-Host "`nQUALITY GATE PASSED" -ForegroundColor Green
}
catch {
    Write-Error $_
    exit 1
}
finally {
    Pop-Location
}
```

- [ ] **Step 2: Verify the script from the repository root**

```powershell
pwsh -File scripts/quality-gate.ps1
```

Expected: stages appear in the documented order and the final line is `QUALITY GATE PASSED`; any failure exits 1 and names the failed stage.

- [ ] **Step 3: Commit the local gate**

```powershell
git add scripts/quality-gate.ps1
git commit -m "ci: add shared local quality gate"
```

Expected: only `scripts/quality-gate.ps1` is included.

### Task 5: Enforce high-risk pull-request evidence

**Files:**
- Create: `scripts/check-risk-evidence.ps1`
- Create: `.github/pull_request_template.md`

- [ ] **Step 1: Implement changed-file classification**

Create `scripts/check-risk-evidence.ps1` with parameters `-BaseRef` and optional `-EventPath`. Normalize changed paths to `/`. When `-BaseRef` is `HEAD`, collect `git diff --name-only HEAD`, `git diff --cached --name-only`, and untracked paths from `git ls-files --others --exclude-standard`; otherwise collect `git diff --name-only "$BaseRef...HEAD"`. Use these regexes:

```powershell
$highRiskPatterns = @(
    '^backend/.*/security/',
    '^backend/.*/config/',
    '^backend/.*/controller/',
    '^backend/.*/service/',
    '^backend/src/main/resources/db/',
    '^frontend/src/api/',
    '^frontend/src/context/AuthContext',
    '^frontend/src/.*(route|Route|router|Router|guard|Guard)',
    '^\.github/',
    '(^|/)(Dockerfile|docker-compose[^/]*|nginx[^/]*|.*\.env[^/]*)$'
)
```

If no changed path matches, print `No high-risk files changed.` and exit 0. If high-risk files match and no `-EventPath` is supplied, print the files and the exact required evidence headings, then exit 0 so local inspection remains usable. If `-EventPath` is supplied, parse `pull_request.body` and require non-empty sections containing `Threat`, `compatibility` or `migration`, `Rollback`, `Regression`, and `Human review`; otherwise throw a descriptive error and exit 1.

- [ ] **Step 2: Add the PR evidence template**

Create `.github/pull_request_template.md`:

```markdown
## Summary

- Request and user-visible behavior:
- Non-goals:

## Design

- Chosen approach:
- Alternatives rejected:

## Verification

- [ ] `pwsh -File scripts/quality-gate.ps1` passes
- Commands and real results:
- Unverified integrations or residual risk:

## High-Risk Evidence (complete when applicable)

- Threat surface and authorization impact:
- Data migration and compatibility window:
- Rollback procedure:
- Regression test name and result:
- Human reviewer and approval:
```

- [ ] **Step 3: Verify the checker against the current diff**

```powershell
pwsh -File scripts/check-risk-evidence.ps1 -BaseRef HEAD
```

Expected: it lists the current high-risk files and required evidence without failing because no GitHub event body was supplied.

- [ ] **Step 4: Commit risk evidence controls**

```powershell
git add scripts/check-risk-evidence.ps1 .github/pull_request_template.md
git commit -m "ci: require evidence for high-risk changes"
```

Expected: only the checker and PR template are included.

### Task 6: Add GitHub Actions using the shared gate

**Files:**
- Create: `.github/workflows/quality-gate.yml`

- [ ] **Step 1: Create the workflow**

Use this workflow:

```yaml
name: quality-gate

on:
  push:
    branches: [main, master]
  pull_request:

permissions:
  contents: read

jobs:
  quality:
    runs-on: windows-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Set up Java 21
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: maven

      - name: Run shared quality gate
        shell: pwsh
        run: ./scripts/quality-gate.ps1

      - name: Check high-risk evidence
        if: github.event_name == 'pull_request'
        shell: pwsh
        env:
          GITHUB_EVENT_PATH: ${{ github.event_path }}
        run: ./scripts/check-risk-evidence.ps1 -BaseRef "origin/${{ github.base_ref }}" -EventPath $env:GITHUB_EVENT_PATH
```

- [ ] **Step 2: Validate workflow syntax and references locally**

Run:

```powershell
rg -n "quality-gate.ps1|check-risk-evidence.ps1|node-version|java-version|pull_request|push" .github/workflows/quality-gate.yml
git diff --check
```

Expected: both scripts, Node 22, Java 21, push, and pull-request triggers are present; `git diff --check` exits 0.

- [ ] **Step 3: Commit the workflow**

```powershell
git add .github/workflows/quality-gate.yml
git commit -m "ci: run quality gate on pushes and PRs"
```

Expected: only the workflow file is included.

### Task 7: Full governance verification and audit handoff

**Files:**
- Verify: `AGENTS.md`, `CLAUDE.md`, `docs/engineering/ai-code-standard.md`, `docs/engineering/ai-delivery-record-template.md`, `scripts/quality-gate.ps1`, `scripts/check-risk-evidence.ps1`, `.github/pull_request_template.md`, `.github/workflows/quality-gate.yml`, `frontend/package.json`

- [ ] **Step 1: Run the complete local gate**

```powershell
pwsh -File scripts/quality-gate.ps1
```

Expected: all six stages pass and the process exits 0.

- [ ] **Step 2: Run audit and placeholder scans**

```powershell
rg -n "deferred|placeholder|fill in details" AGENTS.md CLAUDE.md docs/engineering scripts .github frontend/package.json
rg -n "claude-code-everything.*(installed|enabled|invoked)|superpowers|quality-gate|high-risk|human review" AGENTS.md CLAUDE.md docs/engineering .github scripts
git diff --check
git status --short
```

Expected: the first scan has no output; the second scan shows the required governance terms and does not claim the unavailable plugin is installed; the diff check is clean. Existing user changes may remain in `git status` and must not be staged by this plan.

- [ ] **Step 3: Confirm commit scope and history**

```powershell
git log --oneline --decorate -8
git diff --stat HEAD~7..HEAD
```

Expected: governance commits contain only the files listed in this plan, with no business-code or generated-file changes.

- [ ] **Step 4: Complete the delivery record for this governance change**

Copy `docs/engineering/ai-delivery-record-template.md` to a review location or PR description, fill in the exact gate output and the fact that `claude-code-everything` is unavailable, and obtain human review before merging the governance changes.

## Plan Self-Review

- **Spec coverage:** Tasks 1-2 cover repository contracts, standards, delivery records, plugin truthfulness, and high-risk policy. Tasks 3-4 cover frontend testing and the six-stage local gate. Tasks 5-6 cover high-risk evidence, PR review, and push/PR CI. Task 7 covers acceptance criteria, auditability, and final verification.
- **Placeholder scan:** A scan for deferred or placeholder language returns no output; all commands, paths, headings, patterns, and expected outcomes are specified.
- **Type/path consistency:** `frontend/package.json` exposes `npm run test`; `scripts/quality-gate.ps1` invokes it from `frontend`; the workflow invokes the same root script. The risk checker parameters match the workflow invocation. Every created path appears in the file map and in exactly one owning task.
