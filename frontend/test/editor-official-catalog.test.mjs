import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { filterOfficialCatalog, filterOfficialResources, loadOfficialCatalog } from '../src/modules/editor/officialCatalog.mjs'

const catalog = {
  categories: [
    {
      id: 1453,
      name: '精选推荐',
      scenes: [{ id: 447, name: '手机海报', width: 1242, height: 2208, iconPath: '/create-design/official/scenes/1453-447.svg' }],
      templates: [{ id: 583048, title: '招生海报', width: 1242, height: 2208, coverPath: '/create-design/official/templates/1453-583048.png' }],
    },
    { id: 2, name: '电商', scenes: [{ id: 9, name: '商品主图', width: 800, height: 800 }], templates: [] },
  ],
}

test('loads only the local official catalog endpoint', async () => {
  const seen = []
  const result = await loadOfficialCatalog(async (url) => {
    seen.push(url)
    return { ok: true, json: async () => catalog }
  })

  assert.deepEqual(seen, ['/create-design/official/catalog.json'])
  assert.equal(result.categories.length, 2)
})

test('filters one official category by template, scene, and category names', () => {
  assert.deepEqual(filterOfficialCatalog(catalog, { categoryId: 1453, query: '招生' }).templates.map((item) => item.id), [583048])
  assert.deepEqual(filterOfficialCatalog(catalog, { categoryId: 1453, query: '手机' }).scenes.map((item) => item.id), [447])
  assert.equal(filterOfficialCatalog(catalog, { categoryId: 2, query: '电商' }).scenes.length, 1)
})

test('normalizes only local public resources and filters them by kind and search text', () => {
  const input = {
    categories: [],
    resources: [
      { id: 1, title: '蓝色背景', kind: 'background', categoryId: 12, categoryName: '插画元素', sceneId: 460, sceneName: '竖版背景', width: 3000, height: 4000, previewPath: '/create-design/official/resources/backgrounds/460-1.png' },
      { id: 2, title: '商务图标', kind: 'component', categoryId: 12, categoryName: '插画元素', sceneId: 517, sceneName: '图标', width: 2000, height: 3000, previewPath: 'https://cdn.example.com/icon.png' },
    ],
  }

  assert.deepEqual(filterOfficialResources(input, { kind: 'background', query: '竖版' }).map((item) => item.id), [1])
  assert.deepEqual(filterOfficialResources(input, { kind: 'component' }), [])
})

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

test('text panel passes grouped local art text to the official-layout browser', async () => {
  const [source, catalogSource] = await Promise.all([
    readFile(new URL('../src/pages/DesignEditorPage.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../public/create-design/official/catalog.json', import.meta.url), 'utf8'),
  ])
  const artText = filterOfficialResources(JSON.parse(catalogSource), { kind: 'asset', sceneId: 459 })

  assert.equal(artText.length, 24)
  assert.ok(artText.every((item) => item.kind === 'asset' && item.sceneId === 459))
  assert.match(source, /import \{ TextResourcePanel, type LicensedFont, type TextResourceGroup \} from '@\/components\/editor\/TextResourcePanel'/)
  assert.match(source, /const officialArtTextResources = useMemo\(\s*\(\) =>\s*filterOfficialResources\(officialCatalog, \{ kind: 'asset', sceneId: 459 \}\)/s)
  assert.match(source, /const textResourceGroups = useMemo<TextResourceGroup\[\]>\(/)
  assert.match(source, /<TextResourcePanel groups=\{textResourceGroups\} fonts=\{LICENSED_FONTS\} onSelect=\{addOfficialResource\} onAddText=\{addTextLayer\} onOpenAiWriter=\{\(\) => setActiveTool\('ai'\)\} \/>/)
  assert.doesNotMatch(source, /<OfficialResourcePanel heading="官网公开艺术字"/)
})

test('text resource panel follows the official compact browse pattern', async () => {
  const [panelSource, editorSource, styles] = await Promise.all([
    readFile(new URL('../src/components/editor/TextResourcePanel.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/DesignEditorPage.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/index.css', import.meta.url), 'utf8'),
  ])

  assert.match(panelSource, /placeholder="搜索文字"/)
  assert.match(panelSource, /resources\.slice\(0, 3\)/)
  assert.match(panelSource, /当前没有匹配的文字素材/)
  assert.match(panelSource, /const \[expandedGroupIds, setExpandedGroupIds\] = useState<string\[\]>\(\[\]\)/)
  assert.match(panelSource, /aria-expanded=\{expanded\}/)
  assert.match(panelSource, /expanded \? '收起' : '全部'/)
  assert.match(panelSource, /onSelect\(resource\)/)
  assert.doesNotMatch(panelSource, /<span>\{resource\.title\}<\/span>/)
  assert.match(editorSource, /'变形标题'/)
  assert.match(editorSource, /'特效文字'/)
  assert.match(styles.replace(/\r\n/g, '\n'), /\.design-editor-text-resource-grid \{ display: grid; grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/)
})

test('text resource panel restores the official quick text and AI entry area', async () => {
  const [panelSource, editorSource, styles] = await Promise.all([
    readFile(new URL('../src/components/editor/TextResourcePanel.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/DesignEditorPage.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/index.css', import.meta.url), 'utf8'),
  ])

  assert.match(panelSource, /onAddText/)
  assert.match(panelSource, /onOpenAiWriter/)
  assert.match(panelSource, /'标题'/)
  assert.match(panelSource, /'副标题'/)
  assert.match(panelSource, /'正文'/)
  assert.match(panelSource, /'竖排文字'/)
  assert.match(panelSource, /'特效文字'/)
  assert.match(panelSource, /AI 文案/)
  assert.match(editorSource, /onAddText=\{addTextLayer\}/)
  assert.match(editorSource, /onOpenAiWriter=\{\(\) => setActiveTool\('ai'\)\}/)
  assert.match(styles, /\.design-editor-text-quick-grid/)
  assert.match(styles, /\.design-editor-text-ai-entry/)
})

test('image panel follows the official upload, search, tag, and grouped browsing pattern', async () => {
  const [panelSource, editorSource, styles] = await Promise.all([
    readFile(new URL('../src/components/editor/ImageResourcePanel.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/DesignEditorPage.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/index.css', import.meta.url), 'utf8'),
  ])

  assert.match(panelSource, /placeholder="搜索图片"/)
  assert.match(panelSource, /const imageTags/)
  assert.match(panelSource, /aria-pressed=\{activeTag === tag\}/)
  assert.match(panelSource, /resources\.slice\(0, 3\)/)
  assert.match(panelSource, /当前没有匹配的图片素材/)
  assert.match(panelSource, /onUpload/)
  assert.match(panelSource, /onAddUrl/)
  assert.match(editorSource, /import \{ ImageResourcePanel, type ImageResourceGroup \} from '@\/components\/editor\/ImageResourcePanel'/)
  assert.match(editorSource, /const officialImageResources = useMemo\(/)
  assert.match(editorSource, /resource\.sceneId !== 459/)
  assert.match(editorSource, /const imageResourceGroups = useMemo<ImageResourceGroup\[\]>\(/)
  assert.match(editorSource, /<ImageResourcePanel/)
  assert.doesNotMatch(editorSource.match(/\{activeTool === 'image' \?[\s\S]*?\) : null\}/)?.[0] || '', /<OfficialResourcePanel heading="公开图片素材"/)
  assert.match(styles, /\.design-editor-image-resource-tags/)
  assert.match(styles, /\.design-editor-image-resource-track/)
  assert.match(styles, /\.design-editor-image-resource-grid \{ display: grid; grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/)
})

test('desktop resource panels reserve the official-width content column without changing the narrow-screen fallback', async () => {
  const [editorSource, styles] = await Promise.all([
    readFile(new URL('../src/pages/DesignEditorPage.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/index.css', import.meta.url), 'utf8'),
  ])

  assert.match(editorSource, /activeTool === 'text' \|\| activeTool === 'image'/)
  assert.match(styles, /\.design-editor-shell--figma \.design-editor-body\.has-tool-panel\.has-resource-panel \{ grid-template-columns: var\(--editor-sidebar-width, 520px\) minmax\(0, 1fr\); \}/)
  assert.match(styles, /@media \(max-width: 1100px\) \{[\s\S]*?\.design-editor-shell--figma \.design-editor-body\.has-tool-panel\.has-resource-panel \{ grid-template-columns: 310px minmax\(0, 1fr\); \}/)
})

test('official resource panel exposes local preview cards and accessible buttons', async () => {
  const source = await readFile(new URL('../src/components/editor/OfficialResourcePanel.tsx', import.meta.url), 'utf8')

  assert.match(source, /aria-label={label}/)
  assert.match(source, /loading="lazy"/)
  assert.match(source, /onSelect\(resource\)/)
  assert.match(source, /当前没有可用的公开资源/)
})

test('official catalog panel exposes category filters and accessible item buttons', async () => {
  const panelSource = await readFile(new URL('../src/components/editor/OfficialCatalogPanel.tsx', import.meta.url), 'utf8')

  assert.match(panelSource, /aria-label="官网公开目录分类"/)
  assert.match(panelSource, /aria-pressed={category\.id === selectedCategoryId}/)
  assert.match(panelSource, /onSelectScene\(scene\)/)
  assert.match(panelSource, /onSelectTemplate\(template\)/)
  assert.match(panelSource, /loading="lazy"/)
})

test('editor uses the local catalog for assets and templates without a remote page request', async () => {
  const [editorSource, packageSource] = await Promise.all([
    readFile(new URL('../src/pages/DesignEditorPage.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ])
  const packageJson = JSON.parse(packageSource)

  assert.match(editorSource, /loadOfficialCatalog/)
  assert.match(editorSource, /queryKey: \['officialEditorCatalog'\]/)
  assert.match(editorSource, /queryFn: \(\) => loadOfficialCatalog\(\)/)
  assert.match(editorSource, /<OfficialCatalogPanel/)
  assert.match(editorSource, /commitDocument\(\{ \.\.\.document, width: scene\.width, height: scene\.height \}\)/)
  assert.match(editorSource, /addImageLayer\(template\.coverPath\)/)
  assert.match(editorSource, /\['brand', Palette, '品牌'\]/)
  assert.doesNotMatch(editorSource, /chuangkit\.com/)
  assert.equal(packageJson.scripts['sync:editor-catalog'], 'node scripts/sync-create-design-catalog.mjs')
})

test('editor inserts local public resources and keeps brush controls local', async () => {
  const source = await readFile(new URL('../src/pages/DesignEditorPage.tsx', import.meta.url), 'utf8')

  assert.match(source, /filterOfficialResources/)
  assert.match(source, /<OfficialResourcePanel heading="公开插画素材"/)
  assert.match(source, /<ImageResourcePanel/)
  assert.match(source, /<OfficialResourcePanel heading="公开背景"/)
  assert.match(source, /<OfficialResourcePanel heading="公开图片组件"/)
  assert.match(source, /const addBackgroundImageLayer = \(resource: OfficialResource\) =>/)
  assert.match(source, /layers: \[layer, \.\.\.document\.layers\]/)
  assert.match(source, /公开目录暂不可用，已保留内置内容/)
  assert.doesNotMatch(source, /公开目录暂不可用，已保留内置素材/)
  assert.match(source, /启用后可在画布空白处自由绘制/)
  assert.doesNotMatch(source, /chuangkit\.com/)
})

test('official catalog cards stay dense and preserve the compact editor breakpoint', async () => {
  const styles = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')

  assert.match(styles, /\.design-editor-official-catalog/)
  assert.match(styles, /\.design-editor-official-categories/)
  assert.match(styles, /\.design-editor-official-card/)
  assert.match(styles, /@media \(max-width: 900px\)/)
})

test('compact editor keeps the resource panel visible in stable grid tracks', async () => {
  const styles = (await readFile(new URL('../src/index.css', import.meta.url), 'utf8')).replace(/\r\n/g, '\n')
  const compactStart = styles.indexOf('@media (max-width: 900px) {\n  .design-editor-shell--figma')
  const compactEnd = styles.indexOf('\n}\n\n@media', compactStart)
  const compactRules = styles.slice(compactStart, compactEnd + 2)

  assert.ok(compactStart >= 0, 'expected a Figma-specific 900px media block')
  assert.ok(compactEnd > compactStart, 'expected the Figma-specific 900px media block to close')
  assert.match(compactRules, /\.design-editor-shell--figma \.design-editor-body\.has-tool-panel,\n  \.design-editor-shell--figma \.design-editor-body\.has-tool-panel\.has-inspector \{ grid-template-columns: 310px minmax\(0, 1fr\); \}/)
  assert.match(compactRules, /\.design-editor-shell--figma \.design-editor-sidebar \{ display: flex; \}/)
  assert.match(compactRules, /\.design-editor-shell--figma \.design-editor-tool-panel \{ display: block; \}/)
  assert.match(compactRules, /\.design-editor-shell--figma \.design-editor-inspector \{ display: none !important; \}/)
  assert.match(styles, /\.design-editor-official-resource-grid \{ display: grid; grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/)
})

test('compact editor breakpoint leaves room for the canvas instead of overflowing controls', async () => {
  const styles = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')

  assert.match(styles, /\.design-editor-shell--figma \.design-editor-topbar-start > \.design-editor-icon-btn:not\(:first-child\) \{ display: none; \}/)
  assert.match(styles, /\.design-editor-shell--figma \.design-editor-top-actions > :not\(\.design-editor-icon-btn\):not\(\.design-editor-share-wrap\):not\(\.design-editor-download-wrap\) \{ display: none; \}/)
  assert.match(styles, /\.design-editor-shell--figma \.design-editor-view-controls > :nth-child\(n\+4\) \{ display: none; \}/)
})
