import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const moduleUrl = new URL('../src/modules/editor/imageEditState.mjs', import.meta.url)

async function loadImageEditState() {
  if (!existsSync(moduleUrl)) return {}
  return import(moduleUrl.href)
}

test('image edit state clamps controls and creates the preview filter', async () => {
  const { createImageEditState, imageEditCssFilter, normalizeImageCrop } = await loadImageEditState()

  assert.equal(typeof createImageEditState, 'function')
  assert.equal(typeof imageEditCssFilter, 'function')
  assert.equal(typeof normalizeImageCrop, 'function')

  const edit = createImageEditState({ brightness: 1.2, contrast: 0.8, saturation: 1.4, blur: 3 })
  assert.equal(imageEditCssFilter(edit), 'brightness(120%) contrast(80%) saturate(140%) blur(3px)')
  assert.deepEqual(normalizeImageCrop({ x: -2, y: 0.8, width: 0.1, height: 2 }), { x: 0, y: 0.8, width: 0.1, height: 0.2 })
})

test('setting an image as background places a canvas-sized layer behind every other layer', async () => {
  const { setLayerAsBackground } = await loadImageEditState()

  assert.equal(typeof setLayerAsBackground, 'function')
  const document = {
    width: 800,
    height: 600,
    layers: [
      { id: 'title', type: 'text', x: 40, y: 32, width: 160, height: 48 },
      { id: 'photo', type: 'image', x: 120, y: 96, width: 320, height: 240 },
    ],
  }

  assert.deepEqual(setLayerAsBackground(document, 'photo'), {
    width: 800,
    height: 600,
    layers: [
      { id: 'photo', type: 'image', x: 0, y: 0, width: 800, height: 600 },
      { id: 'title', type: 'text', x: 40, y: 32, width: 160, height: 48 },
    ],
  })
})

test('crop state resolves to a deterministic source rectangle for canvas export', async () => {
  const { cropImageSourceRect } = await loadImageEditState()

  assert.equal(typeof cropImageSourceRect, 'function')
  assert.deepEqual(cropImageSourceRect(1600, 900, { x: 0.25, y: 0.1, width: 0.5, height: 0.8 }), {
    x: 400,
    y: 90,
    width: 800,
    height: 720,
  })
})

test('adding or selecting an image switches the existing left tool panel to image editing', async () => {
  const [editorSource, panelSource] = await Promise.all([
    readFile(new URL('../src/pages/DesignEditorPage.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/editor/ImageEditPanel.tsx', import.meta.url), 'utf8').catch(() => ''),
  ])

  assert.match(editorSource, /setActiveTool\('image'\)/)
  assert.match(editorSource, /selectedLayer\?\.type === 'image'/)
  assert.match(editorSource, /<ImageEditPanel/)
  assert.match(panelSource, /图片编辑/)
  assert.match(panelSource, /替换图片/)
  assert.match(panelSource, /设为背景/)
  assert.match(panelSource, /滤镜/)
  assert.match(panelSource, /裁剪/)
})
