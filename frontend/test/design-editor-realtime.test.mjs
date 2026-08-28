import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const editorSource = await readFile(new URL('../src/pages/DesignEditorPage.tsx', import.meta.url), 'utf8')
const editorStyles = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')
const bridgeSource = await readFile(new URL('../src/modules/collaboration/collaborationBridge.ts', import.meta.url), 'utf8')
const exportSource = await readFile(new URL('../src/utils/exportCanvasDocument.ts', import.meta.url), 'utf8')
const signalsSource = await readFile(new URL('../src/modules/collaboration/CollaborationCanvasSignals.tsx', import.meta.url), 'utf8')

test('collaboration bridge provides realtime tab synchronization and stable member colors', () => {
  assert.match(bridgeSource, /BroadcastChannel/)
  assert.match(bridgeSource, /storage/)
  assert.match(bridgeSource, /layer-lock/)
  assert.match(bridgeSource, /collaborationColor/)
  assert.match(editorSource, /createCollaborationBridge/)
  assert.match(editorSource, /document-update/)
  assert.match(editorSource, /当前本地改动未被替换/)
})

test('editor locks layers during drag and exposes a readonly sharing mode', () => {
  assert.match(editorSource, /layerLocks\.get\(layer\.id\)/)
  assert.match(editorSource, /layer-unlock/)
  assert.match(editorSource, /isReadOnlyShare/)
  assert.match(editorSource, /只读分享链接已复制/)
  assert.match(editorSource, /design-editor-share-readonly-banner/)
})

test('selected layer resize handles keep a usable screen size at low canvas zoom', () => {
  assert.match(editorSource, /className=\{cn\('design-editor-resize-handle', `is-\$\{corner\}`\)\} style=\{\{ transform: `scale\(\$\{1 \/ scale\}\)` \}\}/)
  assert.match(editorStyles, /\.design-editor-layer \.design-editor-resize-handle \{[^}]*width: 9px;[^}]*height: 9px;/)
  assert.match(editorStyles, /\.design-editor-layer\.is-selected \{[^}]*overflow: visible;/)
})

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
  assert.match(editorStyles, /@media \(max-width: 900px\)[\s\S]*?\.design-editor-sidebar-resize-handle \{ display: none; \}/)
  assert.match(editorStyles, /@media \(max-width: 900px\)[\s\S]*?\.design-editor-shell--figma \.design-editor-sidebar \{ height: 100%; max-height: none; \}/)
  assert.match(editorStyles, /@media \(max-width: 1100px\)[\s\S]*?grid-template-columns: 310px minmax\(0, 1fr\)/)
})

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

test('editor gives the canvas independent width and height resize handles', () => {
  assert.match(editorSource, /aria-label="调整画布宽度"/)
  assert.match(editorSource, /aria-label="调整画布高度"/)
  assert.match(editorSource, /onCanvasResizePointerDown\(event, 'right'\)/)
  assert.match(editorSource, /onCanvasResizePointerDown\(event, 'bottom'\)/)
  assert.match(editorStyles, /\.design-editor-canvas-resize-handle\.is-right/)
  assert.match(editorStyles, /\.design-editor-canvas-resize-handle\.is-bottom/)
})

test('editor keeps a resized canvas at its current zoom instead of immediately fitting it again', () => {
  const resizeHandler = editorSource.match(/const onCanvasResizePointerDown = \(event: React\.PointerEvent<HTMLButtonElement>, axis: 'right' \| 'bottom' \| 'corner'\) => \{([\s\S]*?)\n  \}/)

  assert.ok(resizeHandler, 'expected the canvas resize pointer handler')
  assert.match(resizeHandler[1], /setZoomMode\('manual'\)/)
})

test('export pipeline supports PNG/JPEG, scale and quality controls', () => {
  assert.match(exportSource, /ExportFormat = 'png' \| 'jpeg'/)
  assert.match(exportSource, /scale: Math\.max\(1, Math\.min\(4/)
  assert.match(exportSource, /quality: Math\.max\(0\.1, Math\.min\(1/)
  assert.match(editorSource, /renderDocumentToDataUrl/)
  assert.match(editorSource, /下载 JPEG/)
})

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

test('export pipeline shares the add-panel shape contract', () => {
  assert.match(exportSource, /import \{ drawShape, type ShapeKind \} from '@\/modules\/editor\/addPanelCatalog\.mjs'/)
  assert.match(exportSource, /shape\?: ShapeKind/)
  assert.match(exportSource, /drawShape\(context, layer\.shape \|\| 'rect', layer\.x, layer\.y, layer\.width, layer\.height\)/)
})

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
  assert.match(editorStyles, /\.design-editor-brush-layer \{[^}]*pointer-events: none;/)
  assert.match(editorStyles, /\.design-editor-brush-preview \{[^}]*pointer-events: none;/)
})

test('collaboration canvas signals render remote cursor and layer lock owner', () => {
  assert.match(signalsSource, /design-editor-remote-cursor/)
  assert.match(signalsSource, /design-editor-layer-lock/)
  assert.match(editorSource, /React\.lazy|lazy\(\(\) => import\('@\/modules\/collaboration/)
})
