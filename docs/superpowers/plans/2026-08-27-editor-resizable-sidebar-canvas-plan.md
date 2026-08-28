# Resizable Editor Sidebar And Canvas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users resize the editor sidebar and white artboard while preserving existing persistence, undo, autosave, collaboration, export, and responsive behavior.

**Architecture:** Sidebar dimensions remain view preferences in component state and `localStorage`; CSS custom properties alter the existing grid only on desktop layouts. Artboard dimensions remain `CanvasDocument.width` and `.height`, so drag and numeric updates continue through the existing document pipeline. Pointer drags update the immediate preview and create one undo entry when released.

**Tech Stack:** React 19, TypeScript, CSS custom properties, Pointer Events, Node test runner, Vite.

**Spec:** User-approved bounded design in this task: sidebar right/bottom/corner handles with local persistence; artboard lower-right handle plus numeric width and height fields.

## Global Constraints

- Retain the existing `CanvasDocument` representation and all existing resource-panel changes in the dirty worktree.
- Sidebar values are local browser preferences; canvas values are saved design data.
- Canvas width and height are clamped to `200..8000` px.
- At widths at or below `900px`, the current stable compact layout overrides user sidebar preferences and does not expose desktop resize handles.
- The artboard handle must be screen-size-stable under zoom and must not start brush drawing or layer selection.

---

### Task 1: Lock The Resizing Contract With Regression Tests

**Files:**
- Modify: `frontend/test/design-editor-realtime.test.mjs`
- Test: `frontend/test/design-editor-realtime.test.mjs`

**Interfaces:**
- Consumes: existing source-level test convention for the editor.
- Produces: assertions for sidebar preference persistence, artboard dimensions, zoom-aware drag handling, and responsive CSS constraints.

- [ ] **Step 1: Add a failing sidebar-resize contract test**

```js
test('editor persists desktop sidebar dimensions behind accessible resize handles', () => {
  assert.match(editorSource, /EDITOR_SIDEBAR_SIZE_STORAGE_KEY/)
  assert.match(editorSource, /sidebarSize/)
  assert.match(editorSource, /localStorage\.getItem\(EDITOR_SIDEBAR_SIZE_STORAGE_KEY\)/)
  assert.match(editorSource, /localStorage\.setItem\(EDITOR_SIDEBAR_SIZE_STORAGE_KEY/)
  assert.match(editorSource, /design-editor-sidebar-resize-handle/)
  assert.match(editorSource, /aria-label="调整侧栏宽度"/)
  assert.match(editorSource, /aria-label="调整侧栏高度"/)
  assert.match(editorStyles, /--editor-sidebar-width/)
  assert.match(editorStyles, /--editor-sidebar-height/)
})
```

- [ ] **Step 2: Add a failing artboard-resize contract test**

```js
test('editor resizes canvas dimensions through a scale-aware document drag and numeric controls', () => {
  assert.match(editorSource, /const CANVAS_SIZE_MIN = 200/)
  assert.match(editorSource, /const CANVAS_SIZE_MAX = 8000/)
  assert.match(editorSource, /const clampCanvasSize = \(value: number\)/)
  assert.match(editorSource, /design-editor-canvas-resize-handle/)
  assert.match(editorSource, /aria-label="调整画布宽高"/)
  assert.match(editorSource, /dx \/ scale/)
  assert.match(editorSource, /dy \/ scale/)
  assert.match(editorSource, /label>宽度<input type="number"/)
  assert.match(editorSource, /label>高度<input type="number"/)
  assert.match(editorStyles, /\.design-editor-canvas-resize-handle/)
})
```

- [ ] **Step 3: Run the focused test and verify RED**

Run: `node --test test/design-editor-realtime.test.mjs`

Expected: FAIL only because the new sidebar/artboard resizing behavior is absent.

### Task 2: Implement Sidebar Preference Resizing

**Files:**
- Modify: `frontend/src/pages/DesignEditorPage.tsx`
- Modify: `frontend/src/index.css`
- Test: `frontend/test/design-editor-realtime.test.mjs`

**Interfaces:**
- Consumes: `window.localStorage`, existing `.design-editor-body` grid, and Pointer Events.
- Produces: `sidebarSize` state, drag controls, desktop grid custom properties, and persisted dimensions.

- [ ] **Step 1: Add viewport-safe constants and preference helpers**

Add `EDITOR_SIDEBAR_SIZE_STORAGE_KEY`, a `{ width?: number; height?: number }` preference type, a JSON read helper that rejects non-finite values, and an effect that writes values after a completed pointer drag.

- [ ] **Step 2: Add drag state and three accessible sidebar handles**

Use a ref that records pointer ID, starting client coordinates, starting size, and `right | bottom | corner` axis. Add right, bottom, and corner buttons inside the sidebar; on pointer move clamp width to the remaining workspace and height to the body height. Release pointer capture and persist the final value on pointer up/cancel.

- [ ] **Step 3: Bind local preferences to desktop CSS only**

Attach `--editor-sidebar-width` and `--editor-sidebar-height` only when values exist. Update Figma desktop grid selectors to use the custom-property fallback values; keep `@media (max-width: 900px)` rules authoritative. Add 8px hit targets, cursors, and focus-visible outlines.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test test/design-editor-realtime.test.mjs`

Expected: PASS with the sidebar behavior assertions and all existing test cases.

### Task 3: Implement Artboard Resizing And Numeric Controls

**Files:**
- Modify: `frontend/src/pages/DesignEditorPage.tsx`
- Modify: `frontend/src/index.css`
- Test: `frontend/test/design-editor-realtime.test.mjs`

**Interfaces:**
- Consumes: `CanvasDocument`, `commitDocument`, `scale`, canvas viewport, and the no-selection inspector branch.
- Produces: `resizeCanvas(patch)`, zoom-aware artboard drag, one undo entry per drag, and width/height inputs.

- [ ] **Step 1: Add a clamped numeric update path**

Define `CANVAS_SIZE_MIN`, `CANVAS_SIZE_MAX`, `clampCanvasSize(value)`, and `resizeCanvas(patch)`. Convert finite input values into a clamped document before passing it to `commitDocument`.

- [ ] **Step 2: Add a lower-right artboard pointer handle**

Store a cloned original document, pointer start coordinates, and current scale in a resize ref. During movement, update only document state, dirty state, and collaboration preview with dimensions derived from `dx / scale` and `dy / scale`. On release, append the original document once to undo history and clear redo. Stop propagation and prevent default so no brush event receives the pointer.

- [ ] **Step 3: Add inspector width and height controls and canvas-handle styling**

Place numeric `宽度` and `高度` inputs in the existing no-selected-layer inspector. Render an accessible lower-right handle in `.design-editor-canvas-frame`; scale it by `1 / scale`, make it keyboard-focusable, and provide `nwse-resize` feedback.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test test/design-editor-realtime.test.mjs`

Expected: PASS, including all artboard resize assertions.

### Task 4: Verify, Review, And Record Delivery

**Files:**
- Modify: `docs/superpowers/delivery-records/2026-08-27-editor-text-panel-official-layout.md`

**Interfaces:**
- Consumes: the new editor behavior and repository validation scripts.
- Produces: auditable verification evidence and residual-risk notes.

- [ ] **Step 1: Run frontend checks**

```powershell
cd frontend
node --test test/design-editor-realtime.test.mjs
npm test
npm run lint
npm run build
```

- [ ] **Step 2: Run browser interaction checks**

At a desktop viewport, drag the sidebar from its right edge and lower-right corner; reload to confirm retained size. Drag the artboard lower-right handle, change width and height through the inspector, undo an artboard drag, and verify no brush stroke is created. At `900px`, confirm the compact sidebar remains stable with controls hidden.

- [ ] **Step 3: Run repository review and quality gate**

```powershell
node scripts/codex-code-review.mjs --scope changed-files --format json
pwsh -File scripts/quality-gate.ps1
```

- [ ] **Step 4: Record exact commands, outputs, screenshots, and risks**

Append results to the existing delivery record. State that sidebar preferences are per-browser and that artboard dimension changes affect the saved design; include any check that cannot run and its reason.
