# Editor Add Panel And Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让编辑器添加面板和侧边栏与用户参考图的层级、图标和可操作性对齐。

**Architecture:** 新建一个无 DOM 依赖的本地添加面板目录与形状几何模块，作为面板卡片、形状图层和导出绘制的唯一数据源。新增 `EditorAddPanel` 只负责将目录映射为可访问的按钮；`DesignEditorPage` 保持画布状态和现有操作回调的所有权。

**Tech Stack:** React 19、TypeScript、Lucide React、Node test、现有 Canvas 2D 导出。

**Spec:** `docs/superpowers/specs/2026-08-27-editor-add-panel-sidebar-design.md`

## Global Constraints

- 不增加官网运行时请求、外部素材或依赖。
- 旧的矩形和圆形文档必须保持兼容。
- 画布预览与 `renderDocumentToDataUrl` 使用同一形状绘制规则。
- 不展示没有业务数据支撑的 VIP 或限免状态。
- 不修改现有上传、图层保存、撤销或资源插入 API。

---

### Task 1: 建立可测试的添加目录与形状绘制契约

**Files:**
- Create: `frontend/src/modules/editor/addPanelCatalog.mjs`
- Create: `frontend/src/modules/editor/addPanelCatalog.d.mts`
- Create: `frontend/test/editor-add-panel.test.mjs`

**Interfaces:**
- Produces: `editorAddPanelSections`，包含 `media`、`text`、`shapes`、`components`、`tools` 五个分区及明确动作。
- Produces: `ShapeKind`、`SHAPE_KINDS`、`drawShape(context, shape, x, y, width, height)`，供编辑器和导出器共同使用。

- [ ] **Step 1: 写入失败的添加目录和形状绘制测试**

```js
assert.deepEqual(editorAddPanelSections.map(({ id, title, cards }) => [id, title, cards.length]), [
  ['media', '图片/视频', 2], ['text', '文字', 5], ['shapes', '形状', 6],
  ['components', '组件', 4], ['tools', '工具', 7],
])
assert.deepEqual(SHAPE_KINDS, ['rect', 'triangle', 'circle', 'pill', 'corner', 'sparkle'])
drawShape(context, 'triangle', 10, 20, 30, 40)
assert.deepEqual(calls, [['beginPath'], ['moveTo', 25, 20], ['lineTo', 40, 60], ['lineTo', 10, 60], ['closePath'], ['fill']])
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test test/editor-add-panel.test.mjs`

Expected: FAIL，因为目录和绘制模块尚不存在。

- [ ] **Step 3: 实现最小目录和绘制模块**

```js
export const SHAPE_KINDS = ['rect', 'triangle', 'circle', 'pill', 'corner', 'sparkle']
function fillPolygon(context, points) {
  context.beginPath()
  context.moveTo(...points[0])
  points.slice(1).forEach((point) => context.lineTo(...point))
  context.closePath()
  context.fill()
}
export function drawShape(context, shape, x, y, width, height) {
  if (shape === 'rect') return context.fillRect(x, y, width, height)
  if (shape === 'circle') {
    context.beginPath()
    context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2)
    return context.fill()
  }
  if (shape === 'pill') {
    context.beginPath()
    context.roundRect(x, y, width, height, Math.min(width, height) / 2)
    return context.fill()
  }
  if (shape === 'triangle') return fillPolygon(context, [[x + width / 2, y], [x + width, y + height], [x, y + height]])
  if (shape === 'corner') return fillPolygon(context, [[x, y], [x + width, y], [x + width, y + height]])
  return fillPolygon(context, [[x + width / 2, y], [x + width * .63, y + height * .37], [x + width, y + height / 2], [x + width * .63, y + height * .63], [x + width / 2, y + height], [x + width * .37, y + height * .63], [x, y + height / 2], [x + width * .37, y + height * .37]])
}
```

目录中的卡片使用 `upload`、`text`、`shape`、`tool` 四种动作，不包含无动作或虚构权限状态的卡片。

- [ ] **Step 4: 运行测试并确认通过**

Run: `node --test test/editor-add-panel.test.mjs`

Expected: PASS。

### Task 2: 渲染添加面板并接入现有编辑器动作

**Files:**
- Create: `frontend/src/components/editor/EditorAddPanel.tsx`
- Modify: `frontend/src/pages/DesignEditorPage.tsx`
- Modify: `frontend/src/index.css`
- Modify: `frontend/test/editor-add-panel.test.mjs`

**Interfaces:**
- Consumes: `editorAddPanelSections`、`ShapeKind` 和现有 `addTextLayer`、`addShapeLayer`、文件上传、`setActiveTool`、画布属性回调。
- Produces: 带有五个可访问分区、形状图标行、组件和工具卡网格的 `EditorAddPanel`。

- [ ] **Step 1: 扩展失败测试，覆盖组件可见结构与卡片动作**

```js
assert.match(panelSource, /aria-label="添加资源"/)
assert.match(panelSource, /onAddText\(preset\)/)
assert.match(panelSource, /onAddShape\(shape\)/)
assert.match(panelSource, /onUpload\(\)/)
assert.match(editorSource, /<EditorAddPanel/)
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test test/editor-add-panel.test.mjs`

Expected: FAIL，因为添加面板仍是页面内的简化 JSX。

- [ ] **Step 3: 实现 `EditorAddPanel` 与页面接入**

```tsx
<EditorAddPanel
  onUpload={() => fileInputRef.current?.click()}
  onAddText={addTextLayer}
  onAddShape={addShapeLayer}
  onOpenTool={setActiveTool}
  onOpenCanvasProperties={() => { setInspectorTab('properties'); setInspectorOpen(true) }}
/>
```

将 `ShapeKind` 从目录模块导入；页面中的画布图层使用 `is-${layer.shape}` 类名；将背景、组件、画笔侧边栏图标替换为 `PanelTop`、`Boxes`、`Paintbrush`。`add` 也加入宽侧栏的资源面板轨道。

- [ ] **Step 4: 增加局部样式**

使用浅灰 `#f5f7fb` 卡片、8px 圆角、三列网格和固定最小高度。形状图标行使用等宽按钮；窄屏规则沿用已有 310px 轨道，避免水平溢出。

- [ ] **Step 5: 运行测试、类型检查和构建**

Run:

```bash
node --test test/editor-add-panel.test.mjs
npm run build
```

Expected: 两项命令均以 exit code 0 结束。

### Task 3: 使导出与画布形状一致并完成视觉回归

**Files:**
- Modify: `frontend/src/utils/exportCanvasDocument.ts`
- Modify: `frontend/test/design-editor-realtime.test.mjs`
- Modify: `docs/superpowers/delivery-records/2026-08-27-editor-text-panel-official-layout.md`

**Interfaces:**
- Consumes: `ShapeKind` 和 `drawShape`。
- Produces: 支持六种形状的导出路径，旧图层与现有 `ExportDocument` 输入继续有效。

- [ ] **Step 1: 扩展失败测试，要求导出器使用共享绘制函数**

```js
assert.match(exportSource, /import \{ drawShape, type ShapeKind \} from '@\/modules\/editor\/addPanelCatalog'/)
assert.match(exportSource, /drawShape\(context, layer\.shape \|\| 'rect', layer\.x, layer\.y, layer\.width, layer\.height\)/)
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `node --test test/design-editor-realtime.test.mjs`

Expected: FAIL，因为导出器只识别矩形和圆形。

- [ ] **Step 3: 接入共享绘制函数并保留旧文档兼容性**

```ts
export interface ExportLayer {
  shape?: ShapeKind
}

drawShape(context, layer.shape || 'rect', layer.x, layer.y, layer.width, layer.height)
```

- [ ] **Step 4: 运行完整前端检查**

Run:

```bash
npm test
npm run lint
npm run build
node ../scripts/codex-code-review.mjs --scope changed-files --format json
pwsh -File ../scripts/quality-gate.ps1
```

Expected: 所有命令 exit code 0；代码审查无 high 或 medium finding，质量门禁输出 `QUALITY GATE PASSED`。

- [ ] **Step 5: 浏览器验收并记录证据**

在本地编辑器验证：添加面板五个分区可见；标题、矩形、三角形和圆角矩形能创建图层；组件、模板、AI、画布属性和上传入口可导航或触发既有功能；1440px 与 900px 下侧边栏无重叠。将实际命令、截图路径与残余风险写入交付记录。
