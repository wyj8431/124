# Official Template Create Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make a selected official catalog template open in the editor with its local cover as the initial image layer.

**Architecture:** The modal already has a template's ID, title, dimensions, and local `coverPath`. Extend its existing creation options to pass those values through `designApi.create`. The backend already turns an unknown template ID plus a cover URL into an image-layer canvas, so no backend change is needed.

**Tech Stack:** React 19, TypeScript, TanStack Query, Node.js built-in test runner, Spring Boot API contract.

---

### Task 1: Capture the missing request contract

**Files:**
- Modify: `frontend/test/create-design-catalog.test.mjs`
- Modify: `frontend/src/components/create-design/CreateDesignModal.tsx:260-281,485-495`

- [ ] **Step 1: Write the failing test**

Add a source-level regression test asserting that official catalog template selection passes all required fields:

```js
test('official catalog template selection forwards its id and local cover to design creation', async () => {
  const source = await readFile(
    new URL('../src/components/create-design/CreateDesignModal.tsx', import.meta.url),
    'utf8',
  )

  assert.match(source, /templateId:\s*template\.id/)
  assert.match(source, /templateTitle:\s*template\.title/)
  assert.match(source, /templateCoverUrl:\s*template\.coverPath/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/create-design-catalog.test.mjs`

Expected: the new test fails because `templateId` and `templateCoverUrl` are absent from the modal creation payload.

- [ ] **Step 3: Write minimal implementation**

Expand `handleCreate` options and the `designApi.create` request:

```ts
async (options?: {
  templateId?: number
  templateTitle?: string
  templateCoverUrl?: string
  width?: number
  height?: number
  unit?: DesignUnit
  title?: string
}) => {
  // existing authentication and dimensions logic
  const design = await designApi.create({
    templateId: options?.templateId,
    templateTitle: options?.templateTitle,
    templateCoverUrl: options?.templateCoverUrl,
    title: options?.title ?? '未命名设计',
    width,
    height,
    unit: options?.unit ?? unit,
  })
}
```

Call it from a template card with `template.id`, `template.title`, and `template.coverPath`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- test/create-design-catalog.test.mjs`

Expected: all tests in the file pass.

### Task 2: Verify frontend integration

**Files:**
- Modify: `frontend/test/create-design-catalog.test.mjs`
- Modify: `frontend/src/components/create-design/CreateDesignModal.tsx`

- [ ] **Step 1: Run focused regression coverage**

Run: `npm test -- test/create-design-catalog.test.mjs test/editor-official-catalog.test.mjs`

Expected: both official-catalog and creation-payload tests pass.

- [ ] **Step 2: Run frontend type, lint, and production build checks**

Run:

```bash
npm run lint
npm run build
```

Expected: each command exits with code 0.

- [ ] **Step 3: Run project review and quality gate**

Run:

```powershell
node scripts/codex-code-review.mjs --scope changed-files --format json
pwsh -File scripts/quality-gate.ps1
```

Expected: no medium or high review findings and a successful quality gate.
