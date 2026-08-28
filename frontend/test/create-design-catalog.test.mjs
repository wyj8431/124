import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'

import {
  buildCatalog,
  buildOfficialResources,
  detectAssetExtension,
  downloadAsset,
  fileExists,
  migrateLegacyAsset,
  OFFICIAL_RESOURCE_SCENES,
  removeUnavailableResources,
  removeUnavailableSceneIcons,
  removeUnavailableTemplateCovers,
  sceneAssetUrls,
  templateSearchUrl,
  writeCatalogAtomically,
} from '../scripts/sync-create-design-catalog.mjs'

test('buildCatalog preserves official category, scene, and local asset details', () => {
  const catalog = buildCatalog(
    [
      {
        firstKindId: 1453,
        firstKindName: '精选推荐',
        designKind: [
          {
            kindId: 447,
            kindTitle: '手机海报',
            kindWidth: 1242,
            kindHeight: 2208,
            iconUrl: '//cdn.example.com/scene-icon',
          },
        ],
      },
    ],
    new Map([
      [
        1453,
        [
          {
            designTemplateId: 583048,
            templateTitle: '兴趣班开学季招生宣传海报',
            designTemplateImageUrl: '//cdn.example.com/template-cover',
            width: '1242px',
            height: '2208px',
            designKindId: 447,
            kindTitle: '手机海报',
          },
        ],
      ],
    ]),
  )

  assert.deepEqual(catalog.categories.map(({ id, name }) => ({ id, name })), [
    { id: 1453, name: '精选推荐' },
  ])
  assert.deepEqual(catalog.categories[0].scenes[0], {
    id: 447,
    name: '手机海报',
    width: 1242,
    height: 2208,
    iconPath: '/create-design/official/scenes/1453-447',
  })
  assert.deepEqual(catalog.categories[0].templates[0], {
    id: 583048,
    title: '兴趣班开学季招生宣传海报',
    width: 1242,
    height: 2208,
    sceneId: 447,
    sceneName: '手机海报',
    coverPath: '/create-design/official/templates/1453-583048',
  })
})

test('buildCatalog preserves official print units for scene dimensions', () => {
  const catalog = buildCatalog(
    [
      {
        firstKindId: 2,
        firstKindName: '印刷/办公',
        designKind: [
          { kindId: 12, kindTitle: '名片', kindWidth: '90mm', kindHeight: '54mm', isPrint: true },
        ],
      },
    ],
    new Map(),
  )

  assert.deepEqual(catalog.categories[0].scenes[0], {
    id: 12,
    name: '名片',
    width: 90,
    height: 54,
    unit: 'mm',
    isPrint: true,
    iconPath: '/create-design/official/scenes/2-12',
  })
})

test('buildCatalog includes mapped asset extensions when provided', () => {
  const catalog = buildCatalog(
    [{
      firstKindId: 2,
      firstKindName: '印刷/办公',
      designKind: [{ kindId: 12, kindTitle: '名片', kindWidth: 90, kindHeight: 54 }],
    }],
    new Map([[2, [{
      designTemplateId: 99,
      templateTitle: '名片模板',
      width: 90,
      height: 54,
      designKindId: 12,
    }]]]),
    {
      sceneExtensions: new Map([['2-12', '.svg']]),
      templateExtensions: { '2-99': 'png' },
    },
  )

  assert.equal(catalog.categories[0].scenes[0].iconPath, '/create-design/official/scenes/2-12.svg')
  assert.equal(catalog.categories[0].templates[0].coverPath, '/create-design/official/templates/2-99.png')
})

test('buildOfficialResources maps public illustration scenes to local resource records', () => {
  const kinds = [{
    firstKindId: 12,
    firstKindName: '插画元素',
    designKind: [
      { kindId: 460, kindTitle: '竖版背景' },
      { kindId: 517, kindTitle: '图标' },
      { kindId: 235, kindTitle: '插画元素' },
    ],
  }]
  const templatesByScene = new Map([
    ['12-460', [{ designTemplateId: 101, templateTitle: '蓝色背景', width: '3000px', height: '4000px' }]],
    ['12-517', [{ designTemplateId: 102, templateTitle: '商务图标', width: '2000px', height: '3000px' }]],
    ['12-235', [{ designTemplateId: 103, templateTitle: '人物插画', width: '2000px', height: '2000px' }]],
  ])

  assert.deepEqual(buildOfficialResources(kinds, templatesByScene), [
    { id: 101, title: '蓝色背景', kind: 'background', categoryId: 12, categoryName: '插画元素', sceneId: 460, sceneName: '竖版背景', width: 3000, height: 4000, previewPath: '/create-design/official/resources/backgrounds/460-101' },
    { id: 102, title: '商务图标', kind: 'component', categoryId: 12, categoryName: '插画元素', sceneId: 517, sceneName: '图标', width: 2000, height: 3000, previewPath: '/create-design/official/resources/components/517-102' },
    { id: 103, title: '人物插画', kind: 'asset', categoryId: 12, categoryName: '插画元素', sceneId: 235, sceneName: '插画元素', width: 2000, height: 2000, previewPath: '/create-design/official/resources/assets/235-103' },
  ])
})

test('official resource definitions only use verified illustration scenes', () => {
  assert.deepEqual(
    OFFICIAL_RESOURCE_SCENES.map(({ categoryId, sceneId, kind }) => [categoryId, sceneId, kind]),
    [[12, 460, 'background'], [12, 458, 'background'], [12, 517, 'component'], [12, 459, 'asset'], [12, 574, 'asset'], [12, 233, 'asset'], [12, 669, 'asset'], [12, 232, 'asset'], [12, 235, 'asset']],
  )
})

test('templateSearchUrl requests a verified second scene only when one is provided', () => {
  const resourceUrl = new URL(templateSearchUrl(12, 460))
  const categoryUrl = new URL(templateSearchUrl(12))

  assert.equal(resourceUrl.searchParams.get('first_kind_id'), '12')
  assert.equal(resourceUrl.searchParams.get('second_kind_id'), '460')
  assert.equal(categoryUrl.searchParams.get('first_kind_id'), '12')
  assert.equal(categoryUrl.searchParams.has('second_kind_id'), false)
})

test('sync process downloads public resources locally before atomically replacing the catalog', async () => {
  const source = await readFile(
    new URL('../scripts/sync-create-design-catalog.mjs', import.meta.url),
    'utf8',
  )

  assert.match(source, /OFFICIAL_RESOURCE_SCENES\.map/)
  assert.match(source, /fetchTemplates\(categoryId, sceneId\)/)
  assert.match(source, /resources', resourceFolder\(resource\.kind\)/)
  assert.match(source, /removeUnavailableResources\(/)
  assert.match(source, /writeCatalogAtomically\(path\.join\(OUTPUT_ROOT, 'catalog\.json'\), finalCatalog\)/)
})

test('removeUnavailableResources omits only the resource whose local preview failed', () => {
  const catalog = { resources: [
    { id: 1, kind: 'background', sceneId: 460, previewPath: '/create-design/official/resources/backgrounds/460-1.png' },
    { id: 2, kind: 'asset', sceneId: 235, previewPath: '/create-design/official/resources/assets/235-2.png' },
  ] }

  assert.deepEqual(removeUnavailableResources(catalog, new Set(['background-460-1'])).resources, [
    { id: 2, kind: 'asset', sceneId: 235, previewPath: '/create-design/official/resources/assets/235-2.png' },
  ])
})

test('writeCatalogAtomically renames only after writing a complete next catalog', async () => {
  const calls = []

  await writeCatalogAtomically('/catalog.json', { version: 2, categories: [], resources: [] }, {
    writeFileImpl: async (destination, body) => calls.push(['write', destination, body]),
    renameImpl: async (from, to) => calls.push(['rename', from, to]),
  })

  assert.deepEqual(calls, [
    ['write', '/catalog.json.next', '{\n  "version": 2,\n  "categories": [],\n  "resources": []\n}\n'],
    ['rename', '/catalog.json.next', '/catalog.json'],
  ])
})

test('writeCatalogAtomically preserves the current catalog when the next write fails', async () => {
  const calls = []

  await assert.rejects(
    writeCatalogAtomically('/catalog.json', { version: 2, categories: [], resources: [] }, {
      writeFileImpl: async (destination) => { calls.push(['write', destination]); throw new Error('disk full') },
      renameImpl: async (from, to) => calls.push(['rename', from, to]),
    }),
    /disk full/,
  )

  assert.deepEqual(calls, [['write', '/catalog.json.next']])
})

test('detectAssetExtension uses content type and magic bytes for image assets', () => {
  assert.equal(
    detectAssetExtension({ headers: { 'content-type': 'image/svg+xml; charset=utf-8' } }, new Uint8Array([1, 2, 3]), 'https://cdn.example.com/asset'),
    '.svg',
  )
  assert.equal(
    detectAssetExtension({ headers: { get: () => 'application/octet-stream' } }, new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), 'https://cdn.example.com/asset'),
    '.png',
  )
})

test('downloadAsset retries a terminated official image request before saving it', async () => {
  let attempts = 0
  let saved = null

  await downloadAsset('https://cdn.example.com/template', '/ignored', {
    fetchImpl: async () => {
      attempts += 1
      if (attempts === 1) throw new Error('terminated')
      return {
        ok: true,
        arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
      }
    },
    writeFileImpl: async (_destination, content) => {
      saved = [...content]
    },
    delay: async () => {},
  })

  assert.equal(attempts, 2)
  assert.deepEqual(saved, [1, 2, 3])
})

test('downloadAsset appends the detected extension before saving', async () => {
  let savedDestination = null

  const result = await downloadAsset('https://cdn.example.com/template', '/assets/1453-99', {
    fetchImpl: async () => ({
      ok: true,
      headers: { 'content-type': 'image/png' },
      arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    }),
    writeFileImpl: async (destination) => {
      savedDestination = destination
    },
  })

  assert.equal(savedDestination, '/assets/1453-99.png')
  assert.equal(result.extension, '.png')
})

test('migrateLegacyAsset renames extensionless image files using their magic bytes', async () => {
  let renamed = null

  const result = await migrateLegacyAsset('/assets/1453-99', {
    fileExistsImpl: async (destination) => destination === '/assets/1453-99',
    readFileImpl: async () => new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    renameImpl: async (from, to) => {
      renamed = { from, to }
    },
  })

  assert.deepEqual(renamed, { from: '/assets/1453-99', to: '/assets/1453-99.png' })
  assert.deepEqual(result, { destination: '/assets/1453-99.png', extension: '.png' })
})

test('fileExists treats an inaccessible local asset as missing', async () => {
  assert.equal(await fileExists('/missing', async () => {}), true)
  assert.equal(await fileExists('/missing', async () => { throw new Error('ENOENT') }), false)
})

test('sceneAssetUrls falls back to the scene source category when a reused icon is missing', () => {
  const urls = sceneAssetUrls({
    firstKindId: 1453,
    kindId: 1085,
    iconUrl: '//cdn.example.com/new/7_1453_1085?v=123',
    tempCenterFirstKindId: 1473,
    imgUrl: '//cdn.example.com/designKind/1085',
  })

  assert.deepEqual(urls, [
    'https://cdn.example.com/new/7_1453_1085?v=123',
    'https://pub-cdn-oss.chuangkit.com/content_distribution/template/secondKind/icon/new/7_1473_1085?v=123',
    'https://cdn.example.com/designKind/1085',
  ])
})

test('removeUnavailableSceneIcons keeps scene metadata while omitting unavailable official images', () => {
  const catalog = {
    categories: [
      {
        id: 1473,
        scenes: [
          { id: 1372, name: '视频封面 (3:4)', iconPath: '/create-design/official/scenes/1473-1372' },
          { id: 502, name: '小红书配图', iconPath: '/create-design/official/scenes/1473-502' },
        ],
      },
    ],
  }

  const result = removeUnavailableSceneIcons(catalog, new Set(['1473-1372']))

  assert.deepEqual(result.categories[0].scenes, [
    { id: 1372, name: '视频封面 (3:4)' },
    { id: 502, name: '小红书配图', iconPath: '/create-design/official/scenes/1473-502' },
  ])
})

test('removeUnavailableTemplateCovers omits only templates without a local official cover', () => {
  const catalog = {
    categories: [{
      id: 1453,
      templates: [
        { id: 1, title: '失效图', coverPath: '/create-design/official/templates/1453-1' },
        { id: 2, title: '可用图', coverPath: '/create-design/official/templates/1453-2' },
      ],
    }],
  }

  const result = removeUnavailableTemplateCovers(catalog, new Set(['1453-1']))

  assert.deepEqual(result.categories[0].templates, [
    { id: 2, title: '可用图', coverPath: '/create-design/official/templates/1453-2' },
  ])
})

test('create design modal reads the local official catalog instead of backend scene or template records', async () => {
  const source = await readFile(
    new URL('../src/components/create-design/CreateDesignModal.tsx', import.meta.url),
    'utf8',
  )

  assert.match(source, /\/create-design\/official\/catalog\.json/)
  assert.doesNotMatch(source, /createDesignApi/)
  assert.doesNotMatch(source, /templateApi\.use/)
  assert.doesNotMatch(source, /coverFallback/)
})

test('official catalog template selection forwards its id and local cover to design creation', async () => {
  const source = await readFile(
    new URL('../src/components/create-design/CreateDesignModal.tsx', import.meta.url),
    'utf8',
  )

  assert.match(source, /templateId:\s*template\.id/)
  assert.match(source, /templateTitle:\s*template\.title/)
  assert.match(source, /templateCoverUrl:\s*template\.coverPath/)
})

test('create design sends expired sessions back through the login flow', async () => {
  const source = await readFile(
    new URL('../src/components/create-design/CreateDesignModal.tsx', import.meta.url),
    'utf8',
  )

  assert.match(source, /error instanceof ApiError && error\.code === 401/)
  assert.match(source, /setShowLoginModal\(true\)/)
  assert.match(source, /登录已过期，请重新登录后再创建设计/)
})
