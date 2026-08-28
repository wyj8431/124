# 编辑器图片编辑面板切换 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 点击左侧图片素材添加图片后，在左侧显示可操作且可导出的图片编辑面板。

**Architecture:** 纯函数模块规范化图片效果和裁剪数据，并由 Node 测试直接验证。React 图片编辑面板仅渲染和回调；`DesignEditorPage` 持有选中图层和文档更新，画布和导出管线消费同一效果数据。

**Tech Stack:** React 19、TypeScript、Lucide、Vite、Node test、Canvas 2D。

**Spec:** `docs/superpowers/specs/2026-08-27-editor-image-edit-panel-switch-design.md`

## Global Constraints

- 保留现有图片上传、只读分享、撤销、协作同步和保存路径。
- 不增加官网运行时请求或未实现的 AI 服务入口。
- 所有图片效果必须同时应用于编辑画布和 PNG/JPEG 导出。

---

### Task 1: 图片效果状态契约

**Files:**
- Create: `frontend/src/modules/editor/imageEditState.mjs`
- Create: `frontend/src/modules/editor/imageEditState.d.mts`
- Create: `frontend/test/editor-image-edit-panel.test.mjs`

**Interfaces:**
- Produces: `createImageEditState`, `imageEditCssFilter`, `normalizeImageCrop`, `setLayerAsBackground`。

- [ ] **Step 1: Write the failing test**

```js
assert.equal(imageEditCssFilter(createImageEditState({ brightness: 1.2 })), 'brightness(120%) contrast(100%) saturate(100%) blur(0px)')
assert.deepEqual(normalizeImageCrop({ x: -2, y: .8, width: .1, height: 2 }), { x: 0, y: .8, width: .1, height: .2 })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/editor-image-edit-panel.test.mjs`

Expected: FAIL because the image edit state module does not exist.

- [ ] **Step 3: Write minimal implementation**

```js
export function imageEditCssFilter(state) {
  return `brightness(${Math.round(state.brightness * 100)}%) contrast(${Math.round(state.contrast * 100)}%) saturate(${Math.round(state.saturation * 100)}%) blur(${state.blur}px)`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/editor-image-edit-panel.test.mjs`

Expected: PASS.

### Task 2: 左侧图片编辑面板

**Files:**
- Create: `frontend/src/components/editor/ImageEditPanel.tsx`
- Modify: `frontend/src/pages/DesignEditorPage.tsx`
- Modify: `frontend/src/index.css`
- Modify: `frontend/test/editor-image-edit-panel.test.mjs`

**Interfaces:**
- Consumes: selected image layer, `updateLayer`, existing hidden file input and image upload function.
- Produces: a conditional image editor inside the existing left `image` tool panel.

- [ ] **Step 1: Write the failing integration contract**

```js
assert.match(editorSource, /selectedLayer\?\.type === 'image'/)
assert.match(editorSource, /<ImageEditPanel/)
assert.match(panelSource, /替换图片/)
assert.match(panelSource, /设为背景/)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/editor-image-edit-panel.test.mjs`

Expected: FAIL because neither conditional panel rendering nor component exists.

- [ ] **Step 3: Write minimal implementation**

```tsx
{activeTool === 'image' && selectedLayer?.type === 'image'
  ? <ImageEditPanel layer={selectedLayer} onClose={() => setSelectedLayerId(null)} />
  : <ImageResourcePanel {...imageResourceProps} />}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/editor-image-edit-panel.test.mjs`

Expected: PASS.

### Task 3: 画布与导出一致性

**Files:**
- Modify: `frontend/src/pages/DesignEditorPage.tsx`
- Modify: `frontend/src/utils/exportCanvasDocument.ts`
- Modify: `frontend/test/editor-image-edit-panel.test.mjs`

**Interfaces:**
- Consumes: normalized `imageEdit` state from each image layer.
- Produces: matching CSS canvas preview and Canvas 2D export rendering.

- [ ] **Step 1: Extend the failing test**

```js
assert.match(exportSource, /context\.filter = imageEditCssFilter/)
assert.match(exportSource, /imageEdit\.crop/)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/editor-image-edit-panel.test.mjs`

Expected: FAIL because exported images ignore image edit data.

- [ ] **Step 3: Write minimal implementation**

```ts
context.filter = imageEditCssFilter(layer.imageEdit)
context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, layer.x, layer.y, layer.width, layer.height)
context.filter = 'none'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/editor-image-edit-panel.test.mjs`

Expected: PASS.

### Task 4: Validation and delivery record

**Files:**
- Create: `docs/superpowers/delivery-records/2026-08-27-editor-image-edit-panel-switch.md`

- [ ] **Step 1: Run focused and existing editor tests**

Run: `npm test -- editor-image-edit-panel.test.mjs editor-official-catalog.test.mjs editor-add-panel.test.mjs`

Expected: PASS.

- [ ] **Step 2: Run repository checks and review**

Run: `npm run build`, `pwsh -File scripts/quality-gate.ps1`, `node scripts/codex-code-review.mjs --scope changed-files --format json`

Expected: each command exits with code 0 and review has no high or medium findings.

- [ ] **Step 3: Record evidence**

```markdown
## 验证

- `node --test test/editor-image-edit-panel.test.mjs`: pass
- `npm run build`: pass
```
