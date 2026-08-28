import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../src/pages/KoutuEditorPage.tsx', import.meta.url), 'utf8')

test('submits uploaded images to the matting task API and polls task status', () => {
  assert.match(source, /mattingApi\.createTask/)
  assert.match(source, /mattingApi\.getTask/)
  assert.match(source, /task\.status === 1/)
})

test('shows local demo state and result actions', () => {
  assert.match(source, /本地演示结果/)
  assert.match(source, /下载透明图/)
  assert.match(source, /继续编辑/)
  assert.match(source, /重试/)
})

test('does not restart polling when a task response is unchanged', () => {
  assert.match(source, /return changed \? next : current/)
})

test('keeps failed local uploads retryable', () => {
  assert.match(source, /retryFilesRef/)
  assert.match(source, /aiApi\.upload\(await removePersonBackground\(retryFile\)\)/)
})

const uploadPanel = await readFile(new URL('../src/components/koutu/KoutuUploadPanel.tsx', import.meta.url), 'utf8')
const koutuStyles = await readFile(new URL('../src/styles/koutu-editor.css', import.meta.url), 'utf8')

test('validates GIF and five megabyte upload limit before calling the API', () => {
  assert.match(uploadPanel, /5 \* 1024 \* 1024/)
  assert.match(uploadPanel, /image\/gif/)
  assert.match(uploadPanel, /文件大小不能超过 5MB/)
  assert.match(uploadPanel, /图片类型不受支持/)
})

test('uses a local poster before the remote demo video is ready', () => {
  assert.match(uploadPanel, /poster=\{KOUTU_DEMO_POSTER\}/)
})

test('constrains the upload canvas to the mobile viewport', () => {
  assert.match(koutuStyles, /width: min\(400px, calc\(100vw - 48px\)\)/)
  assert.match(koutuStyles, /@media \(max-width: 480px\)[\s\S]*width: min\(400px, calc\(100vw - 32px\)\)/)
})

const cutoutSource = await readFile(new URL('../src/utils/localPersonCutout.ts', import.meta.url), 'utf8')

test('uses person segmentation and exports a transparent foreground PNG', () => {
  assert.match(cutoutSource, /SelfieSegmentation/)
  assert.match(cutoutSource, /segmentationMask/)
  assert.match(cutoutSource, /destination-in/)
  assert.match(cutoutSource, /image\/png/)
})

test('keeps the original local preview while uploading the cutout file', () => {
  assert.match(source, /previewSourcesRef/)
  assert.match(source, /sourceUrl: task\.sourceUrl/)
})
