---
name: code-review
description: "Review changed frontend code for correctness, consistency, dependency safety, and performance, then emit a structured report."
---

# Code Review Skill

工单编号：网站学院-All poster低代码开发平台--Cursor或者Trae配置代码审查Skills能力工单

This skill is the shared Cursor/Trae entry point for frontend code review in the All poster low-code platform. It is intentionally repository-aware: the agent must inspect the current diff, nearby types, package metadata, and local test conventions before reporting a finding.

## Commands

Use the following natural-language or slash-command triggers. Unless a path is explicitly supplied, review the current Git change set (`git diff HEAD --`).

| Trigger | Scope | Focus |
| --- | --- | --- |
| `/review changed-files` | Current staged and unstaged changes | All enabled rules, with cross-file context |
| `/review component-standards` | Current diff or supplied files | React component boundaries, naming, props, state and accessibility |
| `/review performance-issues` | Current diff or supplied files | Render loops, effect dependencies, large work on render, and bundle/dependency risk |
| `/review types-and-contracts` | Current diff or supplied files | TypeScript `any`, API shape drift, nullable values, and unsafe casts |
| `/review --paths <file-or-dir>` | Supplied files | Same rules, restricted to the supplied paths |

The equivalent local adapter is:

```powershell
node cursor-skills/code-review/scripts/review-changed-files.mjs --scope changed-files --format markdown
node cursor-skills/code-review/scripts/review-changed-files.mjs --scope performance-issues --format json
```

Supported options are `--scope`, `--format markdown|json`, `--base <ref>`, `--paths <path,...>`, `--severity high|medium|low|info`, `--max <number>`, and `--rules <json>`. The default rules file is `cursor-skills/code-review/rules.json`; disabling a rule there removes it from the report, and its configured severity is applied before the CLI threshold.

## Review protocol

1. Establish the scope from the command. Do not silently expand a path-scoped review to the whole repository.
2. Read the changed lines and the surrounding implementation. For imports, inspect the imported file when it is inside the repository. For API or type changes, inspect the consumer and producer together.
3. Run the smallest relevant local check when available: `npm run build`, the focused test file, or the repository's lint command. Record failures as verification metadata, not as invented findings.
4. Report only actionable issues. Do not report formatting preferences unless they affect correctness, maintainability, or the documented project conventions.
5. Return the result using the output contract below. Every finding must have a file and 1-based line number when a location exists.

## Rule catalogue

The machine-readable defaults live in `rules.json`. The rules are grouped into the following review dimensions:

- `correctness`: missing local imports, invalid relative import targets, and unsafe runtime assumptions.
- `component-standards`: component and handler naming, React prop/state boundaries, and missing button labels for icon-only controls.
- `types-and-contracts`: explicit `any`, unsafe `as any` casts, and changed API payloads without nearby type declarations.
- `dependency-risk`: wildcard dependency versions, duplicate packages, and imports of dependencies that are not declared by the nearest package manifest.
- `performance`: effect hooks without dependency arrays, expensive work inside render, and unbounded list rendering in changed code.
- `verification`: changed source files without a nearby focused test when the change introduces a new exported behavior.

Rules are advisory. A finding should be raised only when the source evidence supports it. Prefer a small, minimal fix example over a large rewrite.

## Output contract

The JSON output is the canonical form and must match `examples/review-report.schema.json`:

```json
{
  "schemaVersion": "1.0",
  "scope": "changed-files",
  "summary": { "total": 0, "bySeverity": {}, "byCategory": {} },
  "files": [],
  "findings": [
    {
      "id": "types/no-explicit-any",
      "category": "types-and-contracts",
      "severity": "medium",
      "file": "frontend/src/example.tsx",
      "line": 12,
      "title": "Avoid an explicit any type",
      "evidence": "value: any",
      "recommendation": "Use a domain type or unknown with a narrowed guard.",
      "fix": "const value: Example = ..."
    }
  ],
  "verification": { "commands": [], "status": "not-run" }
}
```

Markdown is a human-readable projection of the same object. Keep findings ordered by severity (`high`, `medium`, `low`, `info`), then file and line. An empty review is a valid result and must say so explicitly.

## Hooks and integrations

Cursor or Trae may run `scripts/review-changed-files.mjs` before a pull request is opened. A CI job can consume `--format json` and fail only on `high` findings. The adapter is dependency-free and exits with code `2` when high-severity findings are present, `0` otherwise, and `1` for invalid input or execution errors.

The `examples/review-panel.html` file is a dependency-free integration example. The production React route is `/tools/code-review`; it uses the same report shape and demonstrates command selection, severity filtering, execution state, and result inspection.
