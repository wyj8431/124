import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import test from 'node:test'

const publicRoot = new URL('../public/', import.meta.url)
const manifest = JSON.parse(await readFile(new URL('fonts/fonts.json', publicRoot), 'utf8'))
const license = await readFile(new URL('fonts/OFL-1.1.txt', publicRoot), 'utf8')
const editorSource = await readFile(new URL('../src/pages/DesignEditorPage.tsx', import.meta.url), 'utf8')
const exportSource = await readFile(new URL('../src/utils/exportCanvasDocument.ts', import.meta.url), 'utf8')
const stylesheet = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')
const panelSource = await readFile(new URL('../src/components/editor/TextResourcePanel.tsx', import.meta.url), 'utf8')

test('bundled fonts have local assets and an explicit OFL redistribution record', async () => {
  assert.equal(manifest.license.spdx, 'OFL-1.1')
  assert.match(license, /SIL OPEN FONT LICENSE/i)
  assert.deepEqual(manifest.fonts.map(({ family }) => family), [
    'Source Han Sans SC',
    'Source Han Serif SC',
    'ZCOOL KuaiLe',
    'ZCOOL XiaoWei',
    'Ma Shan Zheng',
    'Long Cang',
    'LXGW WenKai',
    'Smiley Sans Oblique',
    'Zhi Mang Xing',
    'Liu Jian Mao Cao',
    'ZCOOL QingKe HuangYou',
    'DotGothic16',
    'Dela Gothic One',
    'Rampart One',
    'Reggae One',
    'RocknRoll One',
    'Zen Kurenaido',
    'Kaisei Decol',
    'Bungee Shade',
    'Fascinate',
    'Rubik Glitch',
    'Monoton',
    'Black Ops One',
    'Righteous',
  ])
  assert.deepEqual(manifest.screeningSources.map(({ name }) => name), ['字体家', '字体天下', '100font', 'Google Fonts'])

  for (const font of manifest.fonts) {
    assert.equal(font.license.spdx, 'OFL-1.1')
    assert.ok(font.sourcePages.some((source) => source.url.startsWith('https://')))
    assert.match(font.file, /^\/fonts\/[\w-]+\.(?:otf|ttf)$/)
    assert.match(font.sha256, /^[a-f0-9]{64}$/)
    assert.match(font.officialDownloadUrl, /^https:\/\//)
    await access(path.join(fileURLToPath(publicRoot), font.file.replace(/^\//, '')))
  }
})

test('editor renders and exports the selected bundled font family', () => {
  assert.match(editorSource, /fontFamily\?: string/)
  assert.match(editorSource, /<label>字体<select value=\{selectedLayer\.fontFamily \|\| 'Source Han Sans SC'\}/)
  assert.match(editorSource, /fontFamily: layer\.fontFamily \|\| 'Source Han Sans SC'/)
  assert.match(exportSource, /fontFamily\?: string/)
  assert.match(exportSource, /const fontFamily = layer\.fontFamily \|\| 'Source Han Sans SC'/)
  assert.match(exportSource, /\$\{fontFamily\}", sans-serif/)
  assert.match(exportSource, /window\.document\.fonts\.load/)
  assert.match(stylesheet, /font-family: 'Source Han Sans SC'/)
  assert.match(stylesheet, /font-family: 'Source Han Serif SC'/)
})

test('text resource panel exposes every bundled licensed font and adds a matching text layer', () => {
  assert.match(panelSource, /type LicensedFont =/)
  assert.match(panelSource, /fonts\.filter/)
  assert.match(panelSource, /已授权字体/)
  assert.match(panelSource, /fontFamily: font\.family/)
  assert.match(panelSource, /font\.sampleText \?\? '示例文字'/)
  assert.match(panelSource, /font\.displayName/)
  assert.match(editorSource, /Source Han Sans SC/)
  assert.match(editorSource, /ZCOOL KuaiLe/)
  assert.match(editorSource, /Smiley Sans Oblique/)
  assert.match(editorSource, /Zhi Mang Xing/)
  assert.match(editorSource, /DotGothic16/)
  assert.match(editorSource, /Bungee Shade/)
  assert.match(editorSource, /Rubik Glitch/)
})
