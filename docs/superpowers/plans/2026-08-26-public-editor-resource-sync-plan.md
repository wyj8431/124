# 编辑器公开资源面板同步 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** 将创客贴公开“插画元素”目录同步为本地快照，在编辑器的素材、图片、背景和组件面板中安全地使用这些资源。

**Architecture:** 同步脚本只在显式开发命令中访问公开接口。它为已验证的二级场景下载预览图，并将记录写入现有本地 catalog.json 的 resources 数组。目录加载器校验本地路径和字段；无状态资源面板只呈现本地项，DesignEditorPage 决定插入普通图片、置底背景图片，或保留现有本地组件和画笔操作。

**Tech Stack:** Node.js ESM、Node test、React 19、TypeScript 6、TanStack Query、Vite 8、现有 CSS 和 Lucide React。

---

## 已验证的公开来源

- 一级分类与场景：GET https://gw.chuangkit.com/contentcopyright/page/module/create/design/kinds?nottrans=true。
- 模板预览：GET https://gw.chuangkit.com/team/distribution/template/centerQuery.do，带 first_kind_id=12 和 second_kind_id。
- 已验证的“插画元素”场景：460、458（背景），517（图标），459（艺术字），574（动态贴纸），233、669、232、235（插画/元素）。
- 公开索引中没有稳定的独立画笔目录，因此画笔只保留当前本地入口。

## File Structure

- Modify: frontend/scripts/sync-create-design-catalog.mjs - 获取二级公开资源、下载到本地、生成版本 2 目录并原子替换索引。
- Modify: frontend/test/create-design-catalog.test.mjs - 覆盖资源索引构建、资源下载路径和原子索引写入。
- Modify: frontend/src/modules/editor/officialCatalog.mjs - 校验、加载和筛选新增资源记录。
- Modify: frontend/src/modules/editor/officialCatalog.d.mts - 声明公共资源类型和筛选函数。
- Create: frontend/src/components/editor/OfficialResourcePanel.tsx - 专门展示本地公开资源的无状态卡片网格。
- Modify: frontend/test/editor-official-catalog.test.mjs - 覆盖资源路径白名单、过滤、运行时不请求官网和面板接入。
- Modify: frontend/src/pages/DesignEditorPage.tsx - 在素材、图片、背景、组件面板中渲染资源，并以对应的画布动作消费。
- Modify: frontend/src/index.css - 为资源区、资源卡片和紧凑断点添加样式。
- Create: docs/superpowers/delivery-records/2026-08-26-public-editor-resource-sync.md - 记录实际范围、来源边界、验证和剩余风险。

## Task 1: 锁定公开资源快照的数据契约

**Files:**
- Modify: frontend/test/create-design-catalog.test.mjs
- Modify: frontend/scripts/sync-create-design-catalog.mjs

- [ ] **Step 1: 写入失败测试，定义二级资源及原子目录写入。**

在现有同步器导入中加入 buildOfficialResources、OFFICIAL_RESOURCE_SCENES、removeUnavailableResources 和 writeCatalogAtomically，并追加：

~~~js
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
~~~

- [ ] **Step 2: 运行测试并确认新导出尚不存在。**

Run: node --test test/create-design-catalog.test.mjs

Expected: FAIL with a missing export for buildOfficialResources or writeCatalogAtomically.

- [ ] **Step 3: 实现资源定义、资源记录和原子索引 helper。**

在同步脚本的路径 helper 旁写入以下实现。资源种类只允许 asset、background、component；不定义 brush。

~~~js
export const OFFICIAL_RESOURCE_SCENES = Object.freeze([
  { categoryId: 12, sceneId: 460, kind: 'background' },
  { categoryId: 12, sceneId: 458, kind: 'background' },
  { categoryId: 12, sceneId: 517, kind: 'component' },
  { categoryId: 12, sceneId: 459, kind: 'asset' },
  { categoryId: 12, sceneId: 574, kind: 'asset' },
  { categoryId: 12, sceneId: 233, kind: 'asset' },
  { categoryId: 12, sceneId: 669, kind: 'asset' },
  { categoryId: 12, sceneId: 232, kind: 'asset' },
  { categoryId: 12, sceneId: 235, kind: 'asset' },
])

function resourceFolder(kind) {
  return kind + 's'
}

function localResourcePath(kind, sceneId, templateId, extension) {
  return assetPath(
    '/create-design/official/resources/' + resourceFolder(kind) + '/' + sceneId + '-' + templateId,
    extension,
  )
}

export function buildOfficialResources(kinds, templatesByScene, options = {}) {
  return OFFICIAL_RESOURCE_SCENES.flatMap(({ categoryId, sceneId, kind }) => {
    const category = kinds.find((item) => Number(item.firstKindId) === categoryId)
    const scene = category?.designKind?.find((item) => Number(item.kindId) === sceneId)
    return (templatesByScene.get(categoryId + '-' + sceneId) ?? []).map((template) => ({
      id: Number(template.designTemplateId),
      title: String(template.templateTitle),
      kind,
      categoryId,
      categoryName: String(category?.firstKindName ?? ''),
      sceneId,
      sceneName: String(scene?.kindTitle ?? template.kindTitle ?? ''),
      width: toNumber(template.width),
      height: toNumber(template.height),
      previewPath: localResourcePath(
        kind,
        sceneId,
        template.designTemplateId,
        extensionForKey(options.resourceExtensions, kind + '-' + sceneId + '-' + template.designTemplateId),
      ),
    }))
  }).filter((resource) =>
    resource.id > 0 &&
    resource.title &&
    resource.categoryName &&
    resource.sceneName &&
    resource.width > 0 &&
    resource.height > 0,
  )
}

export async function writeCatalogAtomically(destination, catalog, {
  writeFileImpl = writeFile,
  renameImpl = rename,
} = {}) {
  const temporaryDestination = destination + '.next'
  await writeFileImpl(temporaryDestination, JSON.stringify(catalog, null, 2) + '\n')
  await renameImpl(temporaryDestination, destination)
}
~~~

扩展 buildCatalog，使其接收 resourceTemplates、resourceExtensions 两项，并返回 version: 2 及 resources: buildOfficialResources(kinds, resourceTemplates, { resourceExtensions })。旧 categories、scenes、templates 字段不得改名。

- [ ] **Step 4: 运行同步器测试并确认通过。**

Run: node --test test/create-design-catalog.test.mjs

Expected: PASS; 现有目录、扩展名、重试和新资源契约测试全部通过。

- [ ] **Step 5: 提交数据契约。**

~~~bash
git add frontend/scripts/sync-create-design-catalog.mjs frontend/test/create-design-catalog.test.mjs
git diff --cached --check
git commit -m "feat(editor): model public sidebar resources"
~~~

仅暂存上述两个文件；若预提交审查出现本次变更的高、中优先级问题，先修复并重新运行测试。

## Task 2: 同步公开二级场景并保留上次成功索引

**Files:**
- Modify: frontend/scripts/sync-create-design-catalog.mjs
- Modify: frontend/test/create-design-catalog.test.mjs
- Modify: frontend/public/create-design/official/catalog.json
- Create: frontend/public/create-design/official/resources/assets/*
- Create: frontend/public/create-design/official/resources/backgrounds/*
- Create: frontend/public/create-design/official/resources/components/*

- [ ] **Step 1: 写入失败测试，锁定已验证来源和下载后的本地路径。**

~~~js
test('resource definitions only use verified illustration scenes', () => {
  assert.deepEqual(
    OFFICIAL_RESOURCE_SCENES.map(({ categoryId, sceneId, kind }) => [categoryId, sceneId, kind]),
    [[12, 460, 'background'], [12, 458, 'background'], [12, 517, 'component'], [12, 459, 'asset'], [12, 574, 'asset'], [12, 233, 'asset'], [12, 669, 'asset'], [12, 232, 'asset'], [12, 235, 'asset']],
  )
})

test('buildCatalog includes only locally named resource previews', () => {
  const kinds = [{ firstKindId: 12, firstKindName: '插画元素', designKind: [{ kindId: 460, kindTitle: '竖版背景' }] }]
  const resources = new Map([['12-460', [{ designTemplateId: 101, templateTitle: '蓝色背景', width: '3000px', height: '4000px' }]]])
  const catalog = buildCatalog(kinds, new Map(), {
    resourceTemplates: resources,
    resourceExtensions: new Map([['background-460-101', '.png']]),
  })
  assert.equal(catalog.resources[0].previewPath, '/create-design/official/resources/backgrounds/460-101.png')
  assert.doesNotMatch(JSON.stringify(catalog.resources[0]), /https?:\/\//)
})

test('removeUnavailableResources omits only the resource whose local preview failed', () => {
  const catalog = { resources: [
    { id: 1, kind: 'background', previewPath: '/create-design/official/resources/backgrounds/460-1.png' },
    { id: 2, kind: 'asset', previewPath: '/create-design/official/resources/assets/235-2.png' },
  ] }
  assert.deepEqual(removeUnavailableResources(catalog, new Set(['background-460-1'])).resources, [
    { id: 2, kind: 'asset', previewPath: '/create-design/official/resources/assets/235-2.png' },
  ])
})
~~~

- [ ] **Step 2: 运行测试并确认目录尚未携带资源。**

Run: node --test test/create-design-catalog.test.mjs

Expected: FAIL because buildCatalog currently ignores resourceTemplates or catalog.resources is absent.

- [ ] **Step 3: 为二级场景请求、下载和失败过滤增加最小实现。**

把 fetchTemplates 改为接收可选 sceneId。只有非空 sceneId 才增加 second_kind_id。

~~~js
async function fetchTemplates(categoryId, sceneId) {
  const params = new URLSearchParams({
    double_sort: '1',
    effect_search: '1',
    accurate_search: '1',
    business_type: '1,2,3,4',
    first_kind_id: String(categoryId),
    sort_type: '0',
    price_type: '0',
    page_no: '1',
    originKeyword: '0',
    isJudge: '0',
    userId: '0',
    page_size: '24',
    renderType: 'csr',
  })
  if (sceneId) params.set('second_kind_id', String(sceneId))
  const data = await fetchJson(GATEWAY + '/team/distribution/template/centerQuery.do?' + params)
  return data.searchVoList ?? []
}
~~~

在 syncCreateDesignCatalog 中，紧随一级分类模板请求后加入：

~~~js
const resourceTemplateEntries = await Promise.all(
  OFFICIAL_RESOURCE_SCENES.map(async ({ categoryId, sceneId }) => [
    categoryId + '-' + sceneId,
    await fetchTemplates(categoryId, sceneId),
  ]),
)
const resourceTemplates = new Map(resourceTemplateEntries)
const resourceExtensions = new Map()
const unavailableResourcePreviews = new Set()
~~~

创建 resources/assets、resources/backgrounds、resources/components 目录。使用 buildOfficialResources 的初始结果创建下载任务，下载目标由 resourceFolder(resource.kind) 和 resource.sceneId + '-' + resource.id 组成。每项从 resourceTemplates 的同一场景中找 designTemplateId，调用已有 migrateLegacyAsset 与 downloadAsset；成功时记录扩展名，失败时写入 unavailableResourcePreviews。新增以下纯函数并在构建最终目录前调用：

~~~js
export function removeUnavailableResources(catalog, unavailableResourceKeys) {
  return {
    ...catalog,
    resources: (catalog.resources ?? []).filter(
      (resource) => !unavailableResourceKeys.has(resource.kind + '-' + resource.sceneId + '-' + resource.id),
    ),
  }
}
~~~

所有下载完成后，按以下顺序构造并暴露目录：

~~~js
const catalog = buildCatalog(kinds, templatesByCategory, { resourceTemplates, resourceExtensions })
const finalCatalog = removeUnavailableResources(
  removeUnavailableTemplateCovers(
    removeUnavailableSceneIcons(catalog, unavailableSceneIcons),
    unavailableTemplateCovers,
  ),
  unavailableResourcePreviews,
)
await writeCatalogAtomically(path.join(OUTPUT_ROOT, 'catalog.json'), finalCatalog)
~~~

同步结果新增 resources 和 unavailableResourcePreviews 计数。不得把 CDN 或官网 URL 写入 catalog.json。

- [ ] **Step 4: 运行同步器测试。**

Run: node --test test/create-design-catalog.test.mjs

Expected: PASS; 单个资源下载失败只会省略对应资源，上一次 catalog.json 不会在写入完成前被替换。

- [ ] **Step 5: 执行显式同步并检查快照边界。**

Run: npm run sync:editor-catalog

Expected: exits 0，输出资源数量和不可用资源数量。

Run: node -e "const fs=require('node:fs');const c=JSON.parse(fs.readFileSync('public/create-design/official/catalog.json'));console.log(c.version,c.resources.length,c.resources.every((r)=>r.previewPath.startsWith('/create-design/official/')))"

Expected: 2、正资源数、true。

- [ ] **Step 6: 提交同步脚本与已验证快照。**

~~~bash
git add frontend/scripts/sync-create-design-catalog.mjs frontend/test/create-design-catalog.test.mjs frontend/public/create-design/official/catalog.json frontend/public/create-design/official/resources
git diff --cached --check
git commit -m "feat(editor): sync public illustration resources"
~~~

不暂存 .superpowers、浏览器状态、用户上传文件或其他同步目录。

## Task 3: 让运行时只加载、校验和筛选本地资源

**Files:**
- Modify: frontend/src/modules/editor/officialCatalog.mjs
- Modify: frontend/src/modules/editor/officialCatalog.d.mts
- Modify: frontend/test/editor-official-catalog.test.mjs
- Create: frontend/src/components/editor/OfficialResourcePanel.tsx

- [ ] **Step 1: 为路径白名单、资源筛选和可访问资源卡片写入失败测试。**

~~~js
import { filterOfficialCatalog, filterOfficialResources, loadOfficialCatalog } from '../src/modules/editor/officialCatalog.mjs'

test('normalizes only local resources and filters by kind and search text', () => {
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

test('resource panel exposes local preview cards and accessible buttons', async () => {
  const source = await readFile(new URL('../src/components/editor/OfficialResourcePanel.tsx', import.meta.url), 'utf8')
  assert.match(source, /aria-label={label}/)
  assert.match(source, /loading="lazy"/)
  assert.match(source, /onSelect\(resource\)/)
  assert.match(source, /当前没有可用的公开资源/)
})
~~~

- [ ] **Step 2: 运行测试并确认缺少资源导出和资源面板。**

Run: node --test test/editor-official-catalog.test.mjs

Expected: FAIL with a missing filterOfficialResources export or ENOENT for OfficialResourcePanel.tsx.

- [ ] **Step 3: 扩展加载器并保留旧目录兼容。**

将本地资源正则和资源归一化函数实现为：

~~~js
const LOCAL_ASSET_PATH = /^\/create-design\/official\/(?:scenes|templates|resources\/(?:assets|backgrounds|components))\//
const RESOURCE_KINDS = new Set(['asset', 'background', 'component'])

function normalizeResource(resource) {
  const id = resource?.id
  const title = normalizeName(resource?.title)
  const kind = normalizeName(resource?.kind)
  const categoryId = resource?.categoryId
  const categoryName = normalizeName(resource?.categoryName)
  const sceneId = resource?.sceneId
  const sceneName = normalizeName(resource?.sceneName)
  const previewPath = normalizeAssetPath(resource?.previewPath)
  if (!isPositiveId(id) || !title || !RESOURCE_KINDS.has(kind) || !isPositiveId(categoryId) || !categoryName || !isPositiveId(sceneId) || !sceneName || !isPositiveNumber(resource?.width) || !isPositiveNumber(resource?.height) || !previewPath) return null
  return { id, title, kind, categoryId, categoryName, sceneId, sceneName, width: resource.width, height: resource.height, previewPath }
}

export function filterOfficialResources(catalog, { kind, query = '' } = {}) {
  const keyword = String(query).trim().toLocaleLowerCase()
  return (Array.isArray(catalog?.resources) ? catalog.resources : []).filter((resource) =>
    (!kind || resource.kind === kind) &&
    (!keyword || (resource.title + ' ' + resource.categoryName + ' ' + resource.sceneName).toLocaleLowerCase().includes(keyword)),
  )
}
~~~

normalizeOfficialCatalog 必须返回 categories 和 resources；缺失 resources 时使用空数组。官方目录 URL 必须保持 /create-design/official/catalog.json，不能新增远端 fetch。

在 officialCatalog.d.mts 写入：

~~~ts
export type OfficialResourceKind = 'asset' | 'background' | 'component'

export interface OfficialResource {
  id: number
  title: string
  kind: OfficialResourceKind
  categoryId: number
  categoryName: string
  sceneId: number
  sceneName: string
  width: number
  height: number
  previewPath: string
}

export interface OfficialCatalog {
  categories: OfficialCategory[]
  resources: OfficialResource[]
}

export function filterOfficialResources(
  catalog: OfficialCatalog | undefined,
  filters?: { kind?: OfficialResourceKind; query?: string },
): OfficialResource[]
~~~

- [ ] **Step 4: 实现无状态资源面板。**

~~~tsx
import type { OfficialResource } from '../../modules/editor/officialCatalog.mjs'

type OfficialResourcePanelProps = {
  heading: string
  label: string
  resources: OfficialResource[]
  onSelect: (resource: OfficialResource) => void
}

export function OfficialResourcePanel({ heading, label, resources, onSelect }: OfficialResourcePanelProps) {
  return (
    <section className="design-editor-official-resource" aria-label={label}>
      <div className="design-editor-asset-section-heading"><strong>{heading}</strong></div>
      {resources.length ? (
        <div className="design-editor-official-resource-grid">
          {resources.slice(0, 24).map((resource) => (
            <button key={resource.kind + '-' + resource.sceneId + '-' + resource.id} type="button" className="design-editor-official-resource-card" aria-label={label + '：' + resource.title} onClick={() => onSelect(resource)}>
              <span className="design-editor-official-resource-preview" aria-hidden="true"><img src={resource.previewPath} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true }} /></span>
              <span>{resource.title}</span>
              <small>{resource.sceneName}</small>
            </button>
          ))}
        </div>
      ) : <p className="design-editor-official-empty">当前没有可用的公开资源</p>}
    </section>
  )
}
~~~

- [ ] **Step 5: 运行目录和组件测试。**

Run: node --test test/editor-official-catalog.test.mjs

Expected: PASS; 外部 URL 被拒绝、旧目录归一化为 resources: []、资源卡片保持按钮语义。

- [ ] **Step 6: 提交本地加载器与展示组件。**

~~~bash
git add frontend/src/modules/editor/officialCatalog.mjs frontend/src/modules/editor/officialCatalog.d.mts frontend/src/components/editor/OfficialResourcePanel.tsx frontend/test/editor-official-catalog.test.mjs
git diff --cached --check
git commit -m "feat(editor): load local public resources"
~~~

## Task 4: 接入素材、图片、背景和组件面板

**Files:**
- Modify: frontend/src/pages/DesignEditorPage.tsx
- Modify: frontend/test/editor-official-catalog.test.mjs

- [ ] **Step 1: 为编辑器动作与本地画笔回退写入失败断言。**

~~~js
test('editor uses local resources and keeps brush controls local', async () => {
  const source = await readFile(new URL('../src/pages/DesignEditorPage.tsx', import.meta.url), 'utf8')
  assert.match(source, /filterOfficialResources/)
  assert.match(source, /<OfficialResourcePanel heading="公开插画素材"/)
  assert.match(source, /<OfficialResourcePanel heading="公开背景"/)
  assert.match(source, /<OfficialResourcePanel heading="公开图片组件"/)
  assert.match(source, /const addBackgroundImageLayer = \(resource: OfficialResource\)/)
  assert.match(source, /layers: \[layer, \.\.\.document\.layers\]/)
  assert.match(source, /画笔工具用于自由绘制/)
  assert.doesNotMatch(source, /chuangkit\.com/)
})
~~~

- [ ] **Step 2: 运行测试并确认编辑器尚未接入资源面板。**

Run: node --test test/editor-official-catalog.test.mjs

Expected: FAIL because OfficialResourcePanel and filterOfficialResources are absent from DesignEditorPage.tsx.

- [ ] **Step 3: 用现有本地 Query 计算三种资源列表。**

在官方目录导入中加入 OfficialResource、filterOfficialResources 和 OfficialResourcePanel。不能创建第二个 Query。

~~~tsx
const officialAssetResources = useMemo(
  () => filterOfficialResources(officialCatalog, { kind: 'asset', query: assetQuery }),
  [assetQuery, officialCatalog],
)
const officialBackgroundResources = useMemo(
  () => filterOfficialResources(officialCatalog, { kind: 'background' }),
  [officialCatalog],
)
const officialComponentResources = useMemo(
  () => filterOfficialResources(officialCatalog, { kind: 'component' }),
  [officialCatalog],
)
~~~

在 addImageLayer 后增加资源动作。组件预览不能被声明为可编辑原件，因此按普通图片图层插入。

~~~tsx
const addOfficialResource = (resource: OfficialResource) => addImageLayer(resource.previewPath)

const addBackgroundImageLayer = (resource: OfficialResource) => {
  if (isReadOnlyShare) {
    setShareNotice('当前链接为只读权限，无法修改设计')
    return
  }
  const layer: EditorLayer = {
    id: createLayerId(),
    type: 'image',
    x: 0,
    y: 0,
    width: document.width,
    height: document.height,
    src: resource.previewPath,
    opacity: 1,
  }
  commitDocument({ ...document, layers: [layer, ...document.layers] })
  setSelectedLayerId(layer.id)
  setInspectorOpen(true)
}
~~~

- [ ] **Step 4: 在四个面板插入资源，同时保留所有本地控件。**

在 assets 内置网格之后加入：

~~~tsx
{officialCatalog ? <OfficialResourcePanel heading="公开插画素材" label="公开插画素材" resources={officialAssetResources} onSelect={addOfficialResource} /> : null}
~~~

在 image 的上传和 URL 控件后加入相同资源，heading 与 label 均改为“公开图片素材”。在 background 的色板后加入：

~~~tsx
{officialCatalog ? <OfficialResourcePanel heading="公开背景" label="公开背景" resources={officialBackgroundResources} onSelect={addBackgroundImageLayer} /> : null}
~~~

在 components 的矩形和圆形按钮后加入：

~~~tsx
{officialCatalog ? <OfficialResourcePanel heading="公开图片组件" label="公开图片组件" resources={officialComponentResources} onSelect={addOfficialResource} /> : null}
~~~

目录加载失败时，每个面板仍展示上传、色板或基础形状，只增加一次“公开目录暂不可用，已保留内置内容”的非阻塞提示。brush 分支保持原样。

- [ ] **Step 5: 运行编辑器目录测试。**

Run: node --test test/editor-official-catalog.test.mjs

Expected: PASS; 背景插入底层，图片组件按图片层插入，运行时代码没有官网域名，画笔没有伪同步数据。

- [ ] **Step 6: 提交编辑器行为。**

~~~bash
git add frontend/src/pages/DesignEditorPage.tsx frontend/test/editor-official-catalog.test.mjs
git diff --cached --check
git commit -m "feat(editor): browse public sidebar resources"
~~~

## Task 5: 完成紧凑样式、交付记录和验证

**Files:**
- Modify: frontend/src/index.css
- Modify: frontend/test/editor-official-catalog.test.mjs
- Create: docs/superpowers/delivery-records/2026-08-26-public-editor-resource-sync.md

- [ ] **Step 1: 写入资源卡片样式的失败断言。**

~~~js
test('public resource cards remain dense at the compact editor breakpoint', async () => {
  const styles = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')
  assert.match(styles, /\.design-editor-official-resource \{/)
  assert.match(styles, /\.design-editor-official-resource-grid \{/)
  assert.match(styles, /\.design-editor-official-resource-card \{/)
  assert.match(styles, /@media \(max-width: 900px\)/)
})
~~~

- [ ] **Step 2: 运行测试并确认选择器尚不存在。**

Run: node --test test/editor-official-catalog.test.mjs

Expected: FAIL with a missing .design-editor-official-resource selector.

- [ ] **Step 3: 添加稳定尺寸的紧凑样式。**

~~~css
.design-editor-official-resource { margin-top: 16px; padding-top: 14px; border-top: 1px solid #e9edf4; }
.design-editor-official-resource-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.design-editor-official-resource-card { min-width: 0; border: 0; border-radius: 7px; padding: 0; color: #61708b; background: transparent; font: inherit; font-size: 10px; text-align: left; cursor: pointer; }
.design-editor-official-resource-card:focus-visible { outline: 2px solid #0773fc; outline-offset: 2px; }
.design-editor-official-resource-preview { display: grid; width: 100%; aspect-ratio: 1 / 1; overflow: hidden; border-radius: 6px; background: #f0f4fb; place-items: center; }
.design-editor-official-resource-preview img { width: 100%; height: 100%; object-fit: cover; }
.design-editor-official-resource-card > span:not(.design-editor-official-resource-preview), .design-editor-official-resource-card small { display: block; overflow: hidden; margin-top: 4px; text-overflow: ellipsis; white-space: nowrap; }
@media (max-width: 900px) { .design-editor-official-resource-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
~~~

- [ ] **Step 4: 写入交付记录模板并以实际命令结果填充。**

~~~md
# 编辑器公开资源同步交付记录

## 范围
- 同步：插画元素分类中的公开背景、图标、艺术字、贴纸和插画预览。
- 未同步：账号、用户/团队资源、远端运行时数据和画笔目录。

## 风险
- 资源为公开预览快照，不代表可编辑原件或许可变更。
- 官网接口变更时，同步失败不会替换现有目录。

## 验证
- 对每条实际执行的命令，记录完整命令、退出码、通过或失败结论，以及任何事实性告警。
- 未执行的命令明确标为“未执行”，不得标为通过。
~~~

- [ ] **Step 5: 执行聚焦和完整验证。**

Run: node --test test/create-design-catalog.test.mjs

Expected: PASS.

Run: node --test test/editor-official-catalog.test.mjs

Expected: PASS.

Run: npm run lint

Expected: exit 0; 记录任何既有非阻断告警。

Run: npm test

Expected: exit 0.

Run: npm run build

Expected: exit 0.

Run: node scripts/codex-code-review.mjs --scope changed-files --format json

Expected: no high or medium finding attributable to this feature.

Run: pwsh -File scripts/quality-gate.ps1

Expected: PASS，或记录精确的既有阻塞及其影响范围。

- [ ] **Step 6: 进行浏览器验证。**

Open: http://127.0.0.1:5173/design/1?preview=1

Expected: 素材、图片、背景、组件面板均显示本地公开缩略图；背景点击后为最底层图层；组件点击后为普通图片图层；画笔只显示本地提示。网络面板不出现 chuangkit.com、gw.chuangkit.com 或官方 CDN 请求。

在小于 900px 的视口重复打开资源面板。

Expected: 卡片保持两列，不遮挡画布或工具栏，长标题截断而不溢出。

- [ ] **Step 7: 提交样式、交付记录和验证后的集成。**

~~~bash
git add frontend/src/index.css frontend/test/editor-official-catalog.test.mjs docs/superpowers/delivery-records/2026-08-26-public-editor-resource-sync.md
git diff --cached --check
git commit -m "feat(editor): complete public resource sidebar"
~~~

只在暂存区完全属于本功能且代码审查没有本次变更的高、中优先级问题时提交。

## Plan Self-Review

- Spec coverage: Task 1 定义版本化本地资源模型和原子索引写入；Task 2 只从已验证的公开二级场景同步本地预览；Task 3 校验并展示本地资源；Task 4 连接素材、图片、背景和组件动作，同时保留画笔本地回退；Task 5 覆盖样式、无远端运行时请求、回归和交付证据。
- Boundary coverage: 计划不使用登录态、Cookie、受限端点、运行时爬取或远端 URL；没有公开画笔目录时不创建伪官方数据。
- Placeholder scan: 计划不含 TBD、TODO、未绑定路径或需要实施者自行补全的实现步骤；交付记录要求逐条记录真实执行结果。
- Type consistency: OfficialResourceKind 的 asset、background、component 贯穿同步器、加载器、面板和编辑器动作；所有资源预览统一使用 previewPath。
