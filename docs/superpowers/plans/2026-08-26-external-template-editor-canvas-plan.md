# 外部模板编辑器初始画布 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make a design created from an official template that is absent from the local database show the selected template in the editor.

**Architecture:** Keep the existing create-design request and editor layer schema. In the backend service's external-template fallback, serialize the official cover as one full-canvas image layer; local templates and blank designs continue using their existing JSON.

**Tech Stack:** Spring Boot 3.2, Java 21, MyBatis-Plus, JUnit 5/Mockito, React 19, TypeScript 6.

---

### Task 1: Confirm the regression test

**Files:**
- Modify: `backend/src/test/java/com/chuangkit/admin/service/DesignServiceTest.java` only if the focused assertion is missing.

- [x] **Step 1: Run the focused test before the fix**

Run from `backend`:

```powershell
$env:JAVA_HOME = 'D:\Program Files\Java\jdk-21.0.12'
.\mvnw.cmd -q -Dtest=DesignServiceTest test
```

Expected: the external-template test fails because the persisted JSON has an empty `layers` array.

### Task 2: Generate the initial external-template image layer

**Files:**
- Modify: `backend/src/main/java/com/chuangkit/admin/service/DesignService.java:67-129`

- [x] **Step 1: Preserve external metadata and dimensions**

Use `templateTitle`, `templateCoverUrl`, and positive request dimensions with `800x600` fallback. Keep the existing local-template branch unchanged.

- [x] **Step 2: Serialize the cover as a full-canvas image layer**

For a nonblank cover URL, persist JSON equivalent to:

```json
{
  "version": "1.0",
  "width": 1242,
  "height": 2208,
  "layers": [
    {
      "id": "official-template-cover",
      "type": "image",
      "x": 0,
      "y": 0,
      "width": 1242,
      "height": 2208,
      "src": "https://example.com/template.png",
      "opacity": 1
    }
  ]
}
```

Escape backslashes, quotes, CR, and LF in the URL before inserting it into JSON. Use an empty canvas when the cover is absent.

- [x] **Step 3: Run the focused test after the fix**

Run the same Maven test command. Expected: all `DesignServiceTest` tests pass.

### Task 3: Verify editor compatibility and delivery evidence

**Files:**
- Create: `docs/superpowers/delivery-records/2026-08-26-external-template-editor-canvas.md`

- [x] **Step 1: Confirm the existing editor renders image layers**

Check `frontend/src/pages/DesignEditorPage.tsx` renders `image` layers from `layer.src`; no frontend change is required.

- [x] **Step 2: Run required checks**

Run from repository root:

```powershell
node scripts/codex-code-review.mjs --scope changed-files --format json
pwsh -File scripts/quality-gate.ps1
```

Also run the focused backend test and frontend build if the full gate cannot complete. Record exact failures, warnings, and skipped checks.

- [x] **Step 3: Record residual risk**

Document that the cover is a single flattened image because the official source does not provide editable canvas JSON, and signed/external CDN URLs may expire.
