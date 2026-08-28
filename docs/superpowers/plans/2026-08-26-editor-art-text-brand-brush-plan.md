# 编辑器艺术字、品牌与画笔 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让编辑器文字面板展示 24 条本地公开艺术字，并提供可保存、可协作、可导出的本地品牌色与自由画笔功能。

**Architecture:** 继续以 `CanvasDocument` 作为唯一可保存和协作的画布状态。艺术字沿用本地 `catalog.json` 与现有资源面板，品牌色作为文档字段保存；每一笔画保存为包含画布坐标点的 `brush` 图层，画布预览用 SVG，导出用 Canvas 圆角线段。

**Tech Stack:** React 19、TypeScript、Vite、TanStack Query、Node `node:test`、CSS、HTML Canvas/SVG。

---

## File Structure

- `frontend/src/modules/editor/officialCatalog.mjs`: 让公开资源筛选器支持按 `sceneId` 精确过滤。
- `frontend/src/pages/DesignEditorPage.tsx`: 定义品牌色与笔触文档字段，展示艺术字和品牌面板，并处理画笔指针生命周期与 SVG 预览。
- `frontend/src/utils/exportCanvasDocument.ts`: 声明可导出的笔触图层，并把笔触渲染为圆角 Canvas 线段。
- `frontend/src/index.css`: 仅增加品牌色删除按钮、画笔控制和不接收指针的笔触预览样式。
- `frontend/test/editor-official-catalog.test.mjs`: 覆盖 `sceneId: 459` 的本地艺术字筛选和文字面板结构。
- `frontend/test/design-editor-realtime.test.mjs`: 覆盖品牌色的兼容回退、画笔指针提交、只读保护和 SVG 预览结构。
- `docs/superpowers/delivery-records/2026-08-26-editor-art-text-brand-brush.md`: 记录实际验证结果、审查证据和剩余风险。

### Task 1: Narrow The Local Official Resource Filter

**Files:**
- Modify: `frontend/src/modules/editor/officialCatalog.mjs`
- Test: `frontend/test/editor-official-catalog.test.mjs`

- [ ] **Step 1: Write the failing scene-filter regression test**

  Add this test after the current resource-normalization test. It proves that a same-kind resource from a different local scene cannot appear in the art-text result.

  ```js
  test('filters local public resources by scene id when requested', () => {
    const input = {
      categories: [],
      resources: [
        { id: 459001, title: '艺术字', kind: 'asset', categoryId: 12, categoryName: '插画元素', sceneId: 459, sceneName: '艺术字', width: 500, height: 300, previewPath: '/create-design/official/resources/assets/459-459001.png' },
        { id: 460001, title: '普通插画', kind: 'asset', categoryId: 12, categoryName: '插画元素', sceneId: 460, sceneName: '插画', width: 500, height: 300, previewPath: '/create-design/official/resources/assets/460-460001.png' },
      ],
    }

    assert.deepEqual(
      filterOfficialResources(input, { kind: 'asset', sceneId: 459 }).map((item) => item.id),
      [459001],
    )
  })
  ```

- [ ] **Step 2: Run the focused test and verify RED**

  Run: `node --test test/editor-official-catalog.test.mjs`

  Expected: the new test fails because `filterOfficialResources` ignores `sceneId` and returns both resources.

- [ ] **Step 3: Implement the smallest scene filter**

  Change the filter signature and predicate in `officialCatalog.mjs` to preserve current calls while accepting a positive numeric scene id:

  ```js
  export function filterOfficialResources(catalog, { kind, sceneId, query = '' } = {}) {
    const keyword = String(query).trim().toLocaleLowerCase()
    const selectedSceneId = Number.isInteger(sceneId) && sceneId > 0 ? sceneId : null
    const resources = Array.isArray(catalog?.resources)
      ? catalog.resources.map(normalizeResource).filter(Boolean)
      : []

    return resources.filter((resource) =>
      (!kind || resource.kind === kind) &&
      (!selectedSceneId || resource.sceneId === selectedSceneId) &&
      (!keyword || `${resource.title} ${resource.categoryName} ${resource.sceneName}`.toLocaleLowerCase().includes(keyword)),
    )
  }
  ```

- [ ] **Step 4: Run the focused test and verify GREEN**

  Run: `node --test test/editor-official-catalog.test.mjs`

  Expected: all tests pass, including the new exact-scene assertion.

- [ ] **Step 5: Commit the isolated catalog behavior**

  ```bash
  git add frontend/src/modules/editor/officialCatalog.mjs frontend/test/editor-official-catalog.test.mjs
  git commit -m "feat(editor): filter official resources by scene"
  ```

### Task 2: Expose The 24 Local Art-Text Resources In The Text Panel

**Files:**
- Modify: `frontend/src/pages/DesignEditorPage.tsx`
- Test: `frontend/test/editor-official-catalog.test.mjs`

- [ ] **Step 1: Write the failing text-panel regression test**

  Add a test that reads the actual local catalog and page source. It must check both the data result and the selected panel wiring:

  ```js
  test('text panel exposes exactly the local public art-text scene as image layers', async () => {
    const [source, catalogSource] = await Promise.all([
      readFile(new URL('../src/pages/DesignEditorPage.tsx', import.meta.url), 'utf8'),
      readFile(new URL('../public/create-design/official/catalog.json', import.meta.url), 'utf8'),
    ])
    const artText = filterOfficialResources(JSON.parse(catalogSource), { kind: 'asset', sceneId: 459 })

    assert.equal(artText.length, 24)
    assert.ok(artText.every((item) => item.kind === 'asset' && item.sceneId === 459))
    assert.match(source, /const officialArtTextResources = useMemo\(\(\) =>\s*filterOfficialResources\(officialCatalog, \{ kind: 'asset', sceneId: 459 \}\)/s)
    assert.match(source, /<OfficialResourcePanel heading="官网公开艺术字" label="官网公开艺术字" resources=\{officialArtTextResources\} onSelect=\{addOfficialResource\}/)
  })
  ```

- [ ] **Step 2: Run the focused test and verify RED**

  Run: `node --test test/editor-official-catalog.test.mjs`

  Expected: the new test fails because `officialArtTextResources` and the `官网公开艺术字` panel do not yet exist.

- [ ] **Step 3: Add the memoized art-text collection and reuse the existing image insertion path**

  Put this memo next to `officialAssetResources`; do not issue a network request or create a second catalog source:

  ```tsx
  const officialArtTextResources = useMemo(
    () => filterOfficialResources(officialCatalog, { kind: 'asset', sceneId: 459 }),
    [officialCatalog],
  )
  ```

  Replace the one-line `activeTool === 'text'` branch with the existing three text presets, the existing add-text button, and this resource section:

  ```tsx
  {officialCatalog ? (
    <OfficialResourcePanel
      heading="官网公开艺术字"
      label="官网公开艺术字"
      resources={officialArtTextResources}
      onSelect={addOfficialResource}
    />
  ) : null}
  {officialCatalogError ? <p className="design-editor-collaboration-muted">公开目录暂不可用，已保留内置内容</p> : null}
  ```

  Keep `addOfficialResource` unchanged so each art-text card remains a normal image layer with the local `previewPath`.

- [ ] **Step 4: Run the focused test and verify GREEN**

  Run: `node --test test/editor-official-catalog.test.mjs`

  Expected: all tests pass; the source assertion sees only the local `sceneId: 459` collection and the catalog reports 24 items.

- [ ] **Step 5: Commit the text-panel behavior**

  ```bash
  git add frontend/src/pages/DesignEditorPage.tsx frontend/test/editor-official-catalog.test.mjs
  git commit -m "feat(editor): add local official art text"
  ```

### Task 3: Persist A Local Brand Palette In Canvas Documents

**Files:**
- Modify: `frontend/src/pages/DesignEditorPage.tsx`
- Modify: `frontend/src/index.css`
- Test: `frontend/test/design-editor-realtime.test.mjs`

- [ ] **Step 1: Write the failing document-and-panel regression test**

  Add this test to prove the source explicitly initializes compatible defaults, saves the palette in `CanvasDocument`, and provides add/apply/remove controls:

  ```js
  test('editor keeps local brand colors in the canvas document with an old-document fallback', () => {
    assert.match(editorSource, /const DEFAULT_BRAND_COLORS = \['#0773fc', '#111827', '#ffffff', '#f8fafc', '#ff6b35', '#16a34a'\]/)
    assert.match(editorSource, /brandColors\?: string\[\]/)
    assert.match(editorSource, /brandColors: \[\.\.\.DEFAULT_BRAND_COLORS\]/)
    assert.match(editorSource, /brandColors: Array\.isArray\(parsed\.brandColors\) \? parsed\.brandColors : fallback\.brandColors/)
    assert.match(editorSource, /const addBrandColor = \(color: string\) =>/)
    assert.match(editorSource, /应用品牌色/)
    assert.match(editorSource, /移除品牌色/)
    assert.match(editorStyles, /\.design-editor-brand-color/)
  })
  ```

- [ ] **Step 2: Run the focused test and verify RED**

  Run: `node --test test/design-editor-realtime.test.mjs`

  Expected: the new test fails because `CanvasDocument` has no `brandColors`, the brand panel uses a hard-coded swatch list, and there are no removal controls.

- [ ] **Step 3: Add compatible document defaults and palette actions**

  Define the defaults once and make each new document own its array:

  ```tsx
  const DEFAULT_BRAND_COLORS = ['#0773fc', '#111827', '#ffffff', '#f8fafc', '#ff6b35', '#16a34a']

  interface CanvasDocument {
    version: string
    width: number
    height: number
    background: string
    brandColors?: string[]
    layers: EditorLayer[]
  }

  function emptyDocument(width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT): CanvasDocument {
    return { version: '1.0', width, height, background: '#ffffff', brandColors: [...DEFAULT_BRAND_COLORS], layers: [] }
  }

  function mergeDocument(parsed: Partial<CanvasDocument>, fallback: CanvasDocument): CanvasDocument {
    return {
      ...fallback,
      ...parsed,
      width: Number(parsed.width) || fallback.width,
      height: Number(parsed.height) || fallback.height,
      background: parsed.background || fallback.background,
      brandColors: Array.isArray(parsed.brandColors) ? parsed.brandColors : fallback.brandColors,
      layers: Array.isArray(parsed.layers) ? parsed.layers : fallback.layers,
    }
  }
  ```

  Add `addBrandColor` and `removeBrandColor` beside the other document actions. Both must call `commitDocument`, so autosave, undo history and collaboration keep using their existing full-document path:

  ```tsx
  const addBrandColor = (color: string) => {
    const nextColor = color.toLowerCase()
    const colors = document.brandColors ?? DEFAULT_BRAND_COLORS
    if (colors.includes(nextColor)) return
    commitDocument({ ...document, brandColors: [...colors, nextColor] })
  }

  const removeBrandColor = (color: string) => {
    commitDocument({ ...document, brandColors: (document.brandColors ?? DEFAULT_BRAND_COLORS).filter((item) => item !== color) })
  }
  ```

  In the `brand` branch, use a color input with `aria-label="新增品牌色"`, apply `onChange={(event) => addBrandColor(event.target.value)}`, map `document.brandColors ?? DEFAULT_BRAND_COLORS` into color-swatch buttons that update `document.background`, and place an icon-only `X` removal button with `aria-label={`移除品牌色 ${color}`}` next to each swatch. Do not use a remote request or browser local storage.

  Add compact CSS for `.design-editor-brand-color`, `.design-editor-brand-color button:first-child`, and `.design-editor-brand-color-remove`; retain the existing six-column swatch grid and use a visible focus outline for both buttons.

- [ ] **Step 4: Run the focused test and verify GREEN**

  Run: `node --test test/design-editor-realtime.test.mjs`

  Expected: all tests pass; old `canvasJson` lacks `brandColors` but receives the default palette, while new palette changes use `commitDocument`.

- [ ] **Step 5: Commit the persisted local palette**

  ```bash
  git add frontend/src/pages/DesignEditorPage.tsx frontend/src/index.css frontend/test/design-editor-realtime.test.mjs
  git commit -m "feat(editor): persist local brand colors"
  ```

### Task 4: Make Brush Layers Exportable

**Files:**
- Modify: `frontend/src/utils/exportCanvasDocument.ts`
- Test: `frontend/test/design-editor-realtime.test.mjs`

- [ ] **Step 1: Write the failing export-branch regression test**

  Add a source-level test that locks the serializable brush contract and its rounded Canvas rendering path:

  ```js
  test('export pipeline renders serializable brush strokes as rounded line segments', () => {
    assert.match(exportSource, /export interface ExportBrushPoint \{\s*x: number\s*y: number\s*\}/s)
    assert.match(exportSource, /type: 'text' \| 'image' \| 'shape' \| 'brush'/)
    assert.match(exportSource, /points\?: ExportBrushPoint\[\]/)
    assert.match(exportSource, /brushWidth\?: number/)
    assert.match(exportSource, /layer\.type === 'brush' && layer\.points\?\.length/)
    assert.match(exportSource, /context\.lineCap = 'round'/)
    assert.match(exportSource, /context\.lineJoin = 'round'/)
    assert.match(exportSource, /context\.moveTo\(first\.x, first\.y\)/)
    assert.match(exportSource, /context\.lineTo\(point\.x, point\.y\)/)
  })
  ```

- [ ] **Step 2: Run the focused test and verify RED**

  Run: `node --test test/design-editor-realtime.test.mjs`

  Expected: the new export test fails because the export-layer union contains only text, image and shape.

- [ ] **Step 3: Extend the exporter without changing image, text, or shape behavior**

  Add the brush types to `exportCanvasDocument.ts` and insert the branch before the image fallback:

  ```ts
  export interface ExportBrushPoint {
    x: number
    y: number
  }

  export interface ExportLayer {
    type: 'text' | 'image' | 'shape' | 'brush'
    x: number
    y: number
    width: number
    height: number
    content?: string
    src?: string
    fontSize?: number
    fontWeight?: number
    color?: string
    opacity?: number
    shape?: 'rect' | 'circle'
    points?: ExportBrushPoint[]
    brushWidth?: number
  }
  ```

  ```ts
  } else if (layer.type === 'brush' && layer.points?.length) {
    const [first, ...rest] = layer.points
    context.strokeStyle = layer.color || '#111827'
    context.lineWidth = Math.max(1, layer.brushWidth || 1)
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.beginPath()
    context.moveTo(first.x, first.y)
    rest.forEach((point) => context.lineTo(point.x, point.y))
    context.stroke()
  }
  ```

  Preserve the surrounding `context.globalAlpha = layer.opacity ?? 1` and final reset so the serialized brush opacity is honored for PNG and JPEG.

- [ ] **Step 4: Run the focused test and verify GREEN**

  Run: `node --test test/design-editor-realtime.test.mjs`

  Expected: all export assertions pass and existing PNG/JPEG option assertions remain green.

- [ ] **Step 5: Commit the exporter contract**

  ```bash
  git add frontend/src/utils/exportCanvasDocument.ts frontend/test/design-editor-realtime.test.mjs
  git commit -m "feat(editor): export brush strokes"
  ```

### Task 5: Draw, Preview, Save, And Undo Local Brush Strokes

**Files:**
- Modify: `frontend/src/pages/DesignEditorPage.tsx`
- Modify: `frontend/src/index.css`
- Test: `frontend/test/design-editor-realtime.test.mjs`

- [ ] **Step 1: Write the failing brush-interaction regression test**

  Add this test to require one pointer-up commit, a local SVG preview, and no drag behavior for persisted brush layers:

  ```js
  test('editor commits local brush strokes on pointer up and keeps their preview non-draggable', () => {
    assert.match(editorSource, /type LayerType = 'text' \| 'image' \| 'shape' \| 'brush'/)
    assert.match(editorSource, /interface BrushPoint \{\s*x: number\s*y: number\s*\}/s)
    assert.match(editorSource, /const \[brushEnabled, setBrushEnabled\] = useState\(false\)/)
    assert.match(editorSource, /const onCanvasPointerDown = \(event: React\.PointerEvent<HTMLDivElement>\) =>/)
    assert.match(editorSource, /const onCanvasPointerUp = \(event: React\.PointerEvent<HTMLDivElement>\) =>/)
    assert.match(editorSource, /type: 'brush', x: 0, y: 0, width: document\.width, height: document\.height/)
    assert.match(editorSource, /commitDocument\(\{ \.\.\.document, layers: \[\.\.\.document\.layers, layer\] \}\)/)
    assert.match(editorSource, /<polyline/)
    assert.match(editorSource, /onPointerUp=\{onCanvasPointerUp\}/)
    assert.match(editorSource, /onPointerCancel=\{onCanvasPointerCancel\}/)
    assert.match(editorStyles, /\.design-editor-brush-layer \{ pointer-events: none; \}/)
    assert.match(editorStyles, /\.design-editor-brush-preview \{ pointer-events: none; \}/)
  })
  ```

- [ ] **Step 2: Run the focused test and verify RED**

  Run: `node --test test/design-editor-realtime.test.mjs`

  Expected: the new test fails because the canvas only clears selection on pointer-down and the brush panel only shows an informational message.

- [ ] **Step 3: Add the brush layer contract, sampling helpers, and one-commit lifecycle**

  Add `BrushPoint` and extend `EditorLayer` with optional `points?: BrushPoint[]` and `brushWidth?: number`. Add state for an explicit enabled mode, color, size, opacity, and an in-progress preview:

  ```tsx
  interface BrushPoint { x: number; y: number }

  const [brushEnabled, setBrushEnabled] = useState(false)
  const [brushColor, setBrushColor] = useState('#111827')
  const [brushWidth, setBrushWidth] = useState(8)
  const [brushOpacity, setBrushOpacity] = useState(1)
  const [brushPreviewPoints, setBrushPreviewPoints] = useState<BrushPoint[]>([])
  const brushStrokeRef = useRef<{ pointerId: number; points: BrushPoint[] } | null>(null)
  ```

  Convert client coordinates with the current zoom scale, sample only a point at least two canvas pixels from the prior point, and never call `commitDocument` during `pointermove`:

  ```tsx
  const canvasPoint = (event: React.PointerEvent<HTMLDivElement>): BrushPoint => {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(document.width, (event.clientX - rect.left) / scale)),
      y: Math.max(0, Math.min(document.height, (event.clientY - rect.top) / scale)),
    }
  }

  const onCanvasPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!brushEnabled) { setSelectedLayerId(null); return }
    if (isReadOnlyShare) { setShareNotice('当前链接为只读权限，无法修改设计'); return }
    const point = canvasPoint(event)
    brushStrokeRef.current = { pointerId: event.pointerId, points: [point] }
    setBrushPreviewPoints([point])
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  ```

  In `onCanvasPointerUp`, ignore unrelated pointers, duplicate a single point to preserve a click-as-dot stroke, create `{ id, type: 'brush', x: 0, y: 0, width: document.width, height: document.height, points, color: brushColor, brushWidth, opacity: brushOpacity }`, then call `commitDocument` exactly once. Clear the ref and preview afterward. Implement `onCanvasPointerCancel` separately so it clears the in-progress ref and preview without creating a layer.

- [ ] **Step 4: Render brush layers and a live SVG overlay without layer drag handlers**

  Add a local `BrushStroke` component above `DesignEditorPage` that takes document width/height, points, color, `brushWidth`, opacity and a class name. It must render a full-canvas SVG using a rounded polyline:

  ```tsx
  function BrushStroke({ width, height, points, color, brushWidth, opacity, className }: {
    width: number; height: number; points: BrushPoint[]; color: string; brushWidth: number; opacity: number; className: string
  }) {
    if (!points.length) return null
    return <svg className={className} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke={color} strokeWidth={brushWidth} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
    </svg>
  }
  ```

  Render `brush` layers through this component, use `design-editor-layer design-editor-brush-layer`, and pass no layer pointer handlers or resize handles for them. Render `brushPreviewPoints` after persisted layers with `design-editor-brush-preview`. On the canvas element, replace the inline pointer-down callback with `onPointerDown={onCanvasPointerDown}`, retain cursor publishing in its pointer-move handler, and add `onPointerUp={onCanvasPointerUp}` plus `onPointerCancel={onCanvasPointerCancel}`. Update `openTool` to disable `brushEnabled` whenever a tool other than `brush` is selected.

  Update the layer-list and inspector labels to call this type `笔触图层`; hide the image URL and position/size inputs for a selected brush layer so its absolute points cannot be moved or resized as a rectangular image.

- [ ] **Step 5: Replace the placeholder brush panel and add CSS**

  Replace the placeholder branch with color, range and enable controls. Use `type="color"` for `brushColor`, `type="range" min="1" max="48"` for `brushWidth`, and `type="range" min="0.1" max="1" step="0.1"` for `brushOpacity`. The icon-and-text command toggles `brushEnabled`, and its text reads `关闭画笔` or `启用画笔` from state. Keep all controls disabled in readonly mode and keep the readonly notice path in the canvas handler.

  Add these rules to `index.css`:

  ```css
  .design-editor-brush-controls { display: grid; gap: 12px; margin-top: 12px; }
  .design-editor-brush-control { display: grid; grid-template-columns: 44px minmax(0, 1fr) 32px; align-items: center; gap: 8px; color: #667085; font-size: 12px; }
  .design-editor-brush-control input[type='range'] { width: 100%; accent-color: #0773fc; }
  .design-editor-brush-layer { pointer-events: none; overflow: visible; }
  .design-editor-brush-preview { position: absolute; inset: 0; z-index: 40; pointer-events: none; overflow: visible; }
  ```

  Give the enabled canvas a `is-brush-active` class and set `cursor: crosshair` for that modifier. Keep the normal move cursor when the mode is not enabled.

- [ ] **Step 6: Run the focused test and verify GREEN**

  Run: `node --test test/design-editor-realtime.test.mjs`

  Expected: all tests pass. The test confirms that drawing is local, commits after pointer-up, uses the existing document update route, and keeps brush SVGs non-draggable.

- [ ] **Step 7: Commit the brush editor interaction**

  ```bash
  git add frontend/src/pages/DesignEditorPage.tsx frontend/src/index.css frontend/test/design-editor-realtime.test.mjs
  git commit -m "feat(editor): draw local brush strokes"
  ```

### Task 6: Verify The Whole Feature And Record Delivery Evidence

**Files:**
- Create: `docs/superpowers/delivery-records/2026-08-26-editor-art-text-brand-brush.md`
- Modify: `docs/engineering/ai-code-standard.md` only if the implementation changes an engineering policy

- [ ] **Step 1: Run focused and full frontend verification**

  Run these commands from `frontend`:

  ```bash
  node --test test/editor-official-catalog.test.mjs
  node --test test/design-editor-realtime.test.mjs
  npm run lint
  npm test
  npm run build
  ```

  Expected: each command exits `0`. Record known non-failing tool warnings separately instead of presenting them as test failures.

- [ ] **Step 2: Perform browser acceptance checks with an existing editable design**

  Start a temporary local server from `frontend`:

  ```bash
  npm run dev -- --host 127.0.0.1 --port 5174
  ```

  In an existing editable design available to the current account, verify these outcomes at desktop and 900px-wide viewports: the text panel shows 24 art-text cards and adding one creates an image layer; a brand color can be added, applied to the background, removed, saved and restored; an enabled brush makes one freehand stroke, Undo removes it, Redo restores it, and PNG plus JPEG exports include it. Open a readonly share link and verify color changes and drawing produce the existing readonly notice without a document mutation. Stop this temporary server before the repository quality gate.

- [ ] **Step 3: Review changed code and run the repository quality gate**

  From the repository root, run:

  ```bash
  node scripts/codex-code-review.mjs --scope changed-files --format json
  pwsh -File scripts/quality-gate.ps1
  ```

  Expected: the review reports no high or medium findings, and the quality gate exits `0`. Fix every high or medium review finding, then rerun both commands before recording success.

- [ ] **Step 4: Write the delivery record with exact evidence**

  Create `docs/superpowers/delivery-records/2026-08-26-editor-art-text-brand-brush.md` from the repository delivery-record template. State that the change is low risk, list the local-only boundary, list each changed file, and include the actual command names, exit statuses, test counts, browser-check results, review JSON summary, quality-gate result, and residual risks. The record must explicitly name the non-goals: remote brand data, remote brush data, eraser, pressure and brush textures.

- [ ] **Step 5: Commit verification evidence**

  ```bash
  git add docs/superpowers/delivery-records/2026-08-26-editor-art-text-brand-brush.md
  git commit -m "docs(editor): record art text brand brush delivery"
  git status --short
  ```

  Expected: the final status contains no unintended tracked changes. Preserve the pre-existing untracked `.superpowers/brainstorm/` directories and `docs/superpowers/plans/2026-08-26-public-editor-resource-sync-plan.md`.
