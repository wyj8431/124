import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { SHAPE_KINDS, drawShape, editorAddPanelSections } from '../src/modules/editor/addPanelCatalog.mjs'

test('editor add catalog maps the reference tiles to executable actions', () => {
  assert.deepEqual(editorAddPanelSections.map(({ id, title, cards }) => [id, title, cards.length]), [
    ['media', '图片/视频', 2],
    ['text', '文字', 5],
    ['shapes', '形状', 6],
    ['components', '组件', 4],
    ['tools', '工具', 7],
  ])

  const cards = editorAddPanelSections.flatMap((section) => section.cards)
  assert.equal(cards.length, 24)
  assert.ok(cards.every((card) => card.action && typeof card.action.type === 'string'))
  assert.deepEqual(
    editorAddPanelSections.find((section) => section.id === 'text')?.cards.map((card) => card.action.presetId),
    ['headline', 'subheading', 'body', 'vertical', 'effect'],
  )
  assert.deepEqual(SHAPE_KINDS, ['rect', 'triangle', 'circle', 'pill', 'corner', 'sparkle'])
})

test('drawShape renders a triangle as a closed canvas path', () => {
  const calls = []
  const context = {
    beginPath: () => calls.push(['beginPath']),
    moveTo: (x, y) => calls.push(['moveTo', x, y]),
    lineTo: (x, y) => calls.push(['lineTo', x, y]),
    closePath: () => calls.push(['closePath']),
    fill: () => calls.push(['fill']),
    fillRect: (x, y, width, height) => calls.push(['fillRect', x, y, width, height]),
    ellipse: (x, y, radiusX, radiusY) => calls.push(['ellipse', x, y, radiusX, radiusY]),
    roundRect: (x, y, width, height, radius) => calls.push(['roundRect', x, y, width, height, radius]),
  }

  drawShape(context, 'triangle', 10, 20, 30, 40)

  assert.deepEqual(calls, [
    ['beginPath'],
    ['moveTo', 25, 20],
    ['lineTo', 40, 60],
    ['lineTo', 10, 60],
    ['closePath'],
    ['fill'],
  ])
})

test('editor add panel renders accessible reference sections and forwards every action', async () => {
  const [panelSource, editorSource, styles] = await Promise.all([
    readFile(new URL('../src/components/editor/EditorAddPanel.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/DesignEditorPage.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/index.css', import.meta.url), 'utf8'),
  ])

  assert.match(panelSource, /aria-label="添加资源"/)
  assert.match(panelSource, /onAddText\(preset\)/)
  assert.match(panelSource, /onAddShape\(shape\)/)
  assert.match(panelSource, /onUpload\(\)/)
  assert.match(panelSource, /onOpenCanvasProperties\(\)/)
  assert.match(editorSource, /<EditorAddPanel/)
  assert.match(editorSource, /\['background', PanelTop, '背景'\]/)
  assert.match(editorSource, /\['components', Boxes, '组件'\]/)
  assert.match(editorSource, /\['brush', Paintbrush, '画笔'\]/)
  assert.match(editorSource, /activeTool === 'text' \|\| activeTool === 'image' \|\| activeTool === 'add'/)
  assert.match(styles, /\.design-editor-add-panel/)
  assert.match(styles, /\.design-editor-add-shape-grid/)
})
