# /review performance-issues

Review the current frontend change set for effect dependencies, expensive render work, and dependency risk:

```powershell
node cursor-skills/code-review/scripts/review-changed-files.mjs --scope performance-issues --format markdown
```

Use the JSON output when a CI or PR integration needs machine-readable results.
