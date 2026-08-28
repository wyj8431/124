# 官网目录侧栏增强 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在设计编辑器中使用项目已有的公开目录快照，提供可筛选的分类、场景和模板封面侧栏。

**Architecture:** 纯 JavaScript 目录模块负责校验、加载和筛选本地 `catalog.json`，让 Node 回归测试可以直接导入。一个小型 React 面板组件只负责呈现可访问的分类、场景和模板卡片；`DesignEditorPage` 保留画布状态与动作，并将卡片点击映射到尺寸更新或现有图片图层创建逻辑。

**Tech Stack:** React 19、TypeScript 6、TanStack Query、Vite 8、Node test、Lucide React、现有 CSS。

---

## File Structure

- Create: `frontend/src/modules/editor/officialCatalog.mjs` — 本地目录的运行时校验、加载和纯筛选函数。
- Create: `frontend/src/modules/editor/officialCatalog.d.mts` — 为 TypeScript 编辑器代码提供目录模块类型。
- Create: `frontend/src/components/editor/OfficialCatalogPanel.tsx` — 分类、场景和模板卡片的无状态展示组件。
- Create: `frontend/test/editor-official-catalog.test.mjs` — 目录模块的行为测试和编辑器集成保护。
- Modify: `frontend/src/pages/DesignEditorPage.tsx` — 加载本地目录、维护筛选状态、渲染面板并处理点击。
- Modify: `frontend/src/index.css` — 目录区域与卡片的紧凑响应式样式。
- Modify: `frontend/package.json` — 添加显式的人工目录同步命令。
- Create: `docs/superpowers/delivery-records/2026-08-26-official-editor-sidebar-catalog.md` — 记录实际改动、验证与风险。

### Task 1: 锁定本地目录模块契约

**Files:**
- Create: `frontend/test/editor-official-catalog.test.mjs`
- Create: `frontend/src/modules/editor/officialCatalog.mjs`
- Create: `frontend/src/modules/editor/officialCatalog.d.mts`

- [ ] **Step 1: 写入失败测试，覆盖本地目录加载和筛选。**

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import { filterOfficialCatalog, loadOfficialCatalog } from '../src/modules/editor/officialCatalog.mjs'

const catalog = {
  categories: [
    { id: 1453, name: '精选推荐', scenes: [{ id: 447, name: '手机海报', width: 1242, height: 2208, iconPath: '/create-design/official/scenes/1453-447.svg' }], templates: [{ id: 583048, title: '招生海报', width: 1242, height: 2208, coverPath: '/create-design/official/templates/1453-583048.png' }] },
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
```

- [ ] **Step 2: 运行测试并确认因模块不存在而失败。**

Run: `node --test test/editor-official-catalog.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/modules/editor/officialCatalog.mjs`.

- [ ] **Step 3: 实现最小目录模块和类型声明。**

```js
const LOCAL_CATALOG_URL = '/create-design/official/catalog.json'

export async function loadOfficialCatalog(fetchImpl = fetch) {
  const response = await fetchImpl(LOCAL_CATALOG_URL)
  if (!response.ok) throw new Error('Official editor catalog is unavailable')
  return normalizeOfficialCatalog(await response.json())
}

export function filterOfficialCatalog(catalog, { categoryId, query = '' }) {
  const category = catalog.categories.find((item) => item.id === categoryId) ?? catalog.categories[0] ?? emptyCategory()
  const keyword = query.trim().toLocaleLowerCase()
  const matches = (item, fields) => !keyword || fields(item).toLocaleLowerCase().includes(keyword)
  return {
    category,
    scenes: category.scenes.filter((scene) => matches(scene, (item) => `${category.name} ${item.name}`)),
    templates: category.templates.filter((template) => matches(template, (item) => `${category.name} ${item.title} ${item.sceneName ?? ''}`)),
  }
}
```

`normalizeOfficialCatalog` 必须只保留正数 ID、非空名称、正数宽高，并把缺失的 `scenes` 和 `templates` 归一化为空数组。`officialCatalog.d.mts` 必须声明 `OfficialCatalog`、`OfficialScene`、`OfficialTemplate`、`OfficialCatalogSelection`、`loadOfficialCatalog` 和 `filterOfficialCatalog` 的实际签名。

- [ ] **Step 4: 运行目录模块测试并确认通过。**

Run: `node --test test/editor-official-catalog.test.mjs`

Expected: PASS, 2 tests passed.

- [ ] **Step 5: 提交目录模块和测试。**

```bash
git add frontend/src/modules/editor/officialCatalog.mjs frontend/src/modules/editor/officialCatalog.d.mts frontend/test/editor-official-catalog.test.mjs
git diff --cached --check
git commit -m "feat(editor): add local official catalog loader"
```

只在暂存区不包含其他人的文件且预提交审查无高、中等级问题时提交。

### Task 2: 创建目录面板组件并锁定交互标记

**Files:**
- Create: `frontend/src/components/editor/OfficialCatalogPanel.tsx`
- Modify: `frontend/test/editor-official-catalog.test.mjs`

- [ ] **Step 1: 为面板组件添加失败的源代码集成断言。**

```js
const panelSource = await readFile(new URL('../src/components/editor/OfficialCatalogPanel.tsx', import.meta.url), 'utf8')

test('official catalog panel exposes category filters and accessible item buttons', () => {
  assert.match(panelSource, /aria-label="官网公开目录分类"/)
  assert.match(panelSource, /aria-pressed={category\.id === selectedCategoryId}/)
  assert.match(panelSource, /onSelectScene\(scene\)/)
  assert.match(panelSource, /onSelectTemplate\(template\)/)
  assert.match(panelSource, /loading="lazy"/)
})
```

- [ ] **Step 2: 运行测试并确认因组件不存在而失败。**

Run: `node --test test/editor-official-catalog.test.mjs`

Expected: FAIL with `ENOENT` for `OfficialCatalogPanel.tsx`.

- [ ] **Step 3: 实现无状态面板组件。**

```tsx
export function OfficialCatalogPanel({
  catalog,
  selection,
  mode,
  selectedCategoryId,
  onSelectCategory,
  onSelectScene,
  onSelectTemplate,
}: Props) {
  return (
    <section className="design-editor-official-catalog" aria-label="官网公开目录">
      <div className="design-editor-asset-section-heading"><strong>官网公开目录</strong></div>
      <div className="design-editor-official-categories" aria-label="官网公开目录分类">
        {catalog.categories.map((category) => (
          <button key={category.id} type="button" aria-pressed={category.id === selectedCategoryId} onClick={() => onSelectCategory(category.id)}>{category.name}</button>
        ))}
      </div>
      <CatalogItemGrid mode={mode} selection={selection} onSelectScene={onSelectScene} onSelectTemplate={onSelectTemplate} />
    </section>
  )
}
```

`mode` 为 `assets` 时显示场景卡片和模板封面卡片；为 `templates` 时只显示模板封面卡片。场景卡片显示名称和 `width × height`；存在 `iconPath` 时懒加载图片，否则显示名称首字。模板封面卡片使用 `coverPath` 和模板标题；图片加载失败时隐藏图像并留下卡片文字。场景或模板为空时显示“当前分类没有匹配的公开素材”。

- [ ] **Step 4: 运行目录模块与面板测试并确认通过。**

Run: `node --test test/editor-official-catalog.test.mjs`

Expected: PASS, 3 tests passed.

- [ ] **Step 5: 提交目录面板。**

```bash
git add frontend/src/components/editor/OfficialCatalogPanel.tsx frontend/test/editor-official-catalog.test.mjs
git diff --cached --check
git commit -m "feat(editor): add official catalog panel"
```

只在暂存区隔离且预提交审查通过时提交。

### Task 3: 接入编辑器侧边栏和画布动作

**Files:**
- Modify: `frontend/src/pages/DesignEditorPage.tsx`
- Modify: `frontend/test/editor-official-catalog.test.mjs`
- Modify: `frontend/package.json`

- [ ] **Step 1: 写入失败测试，保护加载、筛选、尺寸和封面行为。**

```js
const editorSource = await readFile(new URL('../src/pages/DesignEditorPage.tsx', import.meta.url), 'utf8')

test('editor uses the local catalog for assets and templates without a remote page request', () => {
  assert.match(editorSource, /loadOfficialCatalog/)
  assert.match(editorSource, /queryKey: \['officialEditorCatalog'\]/)
  assert.match(editorSource, /<OfficialCatalogPanel/)
  assert.match(editorSource, /commitDocument\(\{ \.\.\.document, width: scene\.width, height: scene\.height \}\)/)
  assert.match(editorSource, /addImageLayer\(template\.coverPath\)/)
  assert.doesNotMatch(editorSource, /chuangkit\.com/)
})
```

- [ ] **Step 2: 运行测试并确认它因集成代码缺失而失败。**

Run: `node --test test/editor-official-catalog.test.mjs`

Expected: FAIL with an assertion that `loadOfficialCatalog` is absent from `DesignEditorPage.tsx`.

- [ ] **Step 3: 将目录加载和动作接入 `DesignEditorPage`。**

```tsx
const { data: officialCatalog, isError: officialCatalogError } = useQuery({
  queryKey: ['officialEditorCatalog'],
  queryFn: loadOfficialCatalog,
  staleTime: Number.POSITIVE_INFINITY,
})
const [officialCategoryId, setOfficialCategoryId] = useState<number | null>(null)
const officialSelection = useMemo(
  () => officialCatalog ? filterOfficialCatalog(officialCatalog, { categoryId: officialCategoryId, query: assetQuery }) : null,
  [assetQuery, officialCatalog, officialCategoryId],
)
const chooseOfficialScene = (scene: OfficialScene) => commitDocument({ ...document, width: scene.width, height: scene.height })
const chooseOfficialTemplate = (template: OfficialTemplate) => addImageLayer(template.coverPath)
```

在 `assets` 面板的内置素材网格后渲染 `<OfficialCatalogPanel mode="assets" />`。目录失败时显示“公开目录暂不可用，已保留内置素材”，不阻塞现有素材。将 `templates` 面板替换为 `<OfficialCatalogPanel mode="templates" />`，并传入相同的目录、分类和动作回调；不得保留第二份官网模板数据。向工具栏添加 `brand` 工具及 `Palette` 图标，并实现只读的颜色快捷项，颜色变化继续通过 `commitDocument` 更新画布背景。向 `package.json` 增加：

```json
"sync:editor-catalog": "node scripts/sync-create-design-catalog.mjs"
```

- [ ] **Step 4: 运行目录测试并确认通过。**

Run: `node --test test/editor-official-catalog.test.mjs`

Expected: PASS, 4 tests passed.

- [ ] **Step 5: 提交编辑器接入。**

```bash
git add frontend/src/pages/DesignEditorPage.tsx frontend/package.json frontend/test/editor-official-catalog.test.mjs
git diff --cached --check
git commit -m "feat(editor): browse local official catalog"
```

只在暂存区隔离且预提交审查通过时提交。

### Task 4: 为紧凑面板补齐样式与交付证据

**Files:**
- Modify: `frontend/src/index.css`
- Modify: `frontend/test/editor-official-catalog.test.mjs`
- Create: `docs/superpowers/delivery-records/2026-08-26-official-editor-sidebar-catalog.md`

- [ ] **Step 1: 写入失败测试，保护目录卡片布局和响应式回退。**

```js
const styles = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')

test('official catalog cards stay dense and preserve the compact editor breakpoint', () => {
  assert.match(styles, /\.design-editor-official-catalog/)
  assert.match(styles, /\.design-editor-official-categories/)
  assert.match(styles, /\.design-editor-official-card/)
  assert.match(styles, /@media \(max-width: 900px\)/)
})
```

- [ ] **Step 2: 运行测试并确认它因样式选择器缺失而失败。**

Run: `node --test test/editor-official-catalog.test.mjs`

Expected: FAIL with an assertion that `.design-editor-official-catalog` is absent.

- [ ] **Step 3: 添加最小样式和交付记录。**

```css
.design-editor-official-catalog { margin-top: 16px; padding-top: 14px; border-top: 1px solid #e9edf4; }
.design-editor-official-categories { display: flex; gap: 6px; overflow-x: auto; padding: 8px 0; }
.design-editor-official-categories button { height: 26px; flex: 0 0 auto; padding: 0 8px; border: 0; border-radius: 6px; color: #61708b; background: #f0f4fb; font: inherit; font-size: 10px; cursor: pointer; }
.design-editor-official-categories button[aria-pressed='true'] { color: #086efa; background: #e6f1ff; }
.design-editor-official-card { min-width: 0; border: 0; border-radius: 7px; color: #61708b; background: transparent; font: inherit; font-size: 10px; text-align: left; cursor: pointer; }
```

保持 `@media (max-width: 900px)` 中的工具面板隐藏规则，使新增目录不会在移动端与画布重叠。交付记录必须列出：用户目标、只使用本地目录的边界、实际文件、测试命令、质量门结果、审查结果、预提交审查因现有无关变更导致的风险。

- [ ] **Step 4: 执行聚焦回归、前端检查和项目质量门。**

Run: `node --test test/editor-official-catalog.test.mjs`

Expected: PASS, all focused catalog tests passed.

Run: `npm run lint && npm test && npm run build`

Expected: PASS; record any pre-existing non-blocking warnings exactly.

Run: `node scripts/codex-code-review.mjs --scope changed-files --format json`

Expected: no high or medium findings for the files changed by this feature.

Run: `pwsh -File scripts/quality-gate.ps1`

Expected: PASS, or record the exact unrelated pre-existing blocker without claiming success.

- [ ] **Step 5: 提交样式、记录和验证过的功能。**

```bash
git add frontend/src/index.css frontend/test/editor-official-catalog.test.mjs docs/superpowers/delivery-records/2026-08-26-official-editor-sidebar-catalog.md
git diff --cached --check
git commit -m "feat(editor): enrich official catalog sidebar"
```

只在已暂存文件完全属于本功能且预提交审查通过时提交；否则保留改动并在交付记录中说明阻塞。

## Plan Self-Review

- Spec coverage: Task 1 implements本地快照加载与公开数据边界；Task 2 implements分类、场景、封面和可访问性；Task 3 implements画布尺寸、封面图片、模板复用、品牌快捷项与人工同步命令；Task 4 implements样式、移动端回退、回归测试和交付证据。
- 完整性检查：计划不包含未决标记、模糊的异常处理描述或依赖前置任务的省略步骤。
- Type consistency: `OfficialScene` 和 `OfficialTemplate` 在声明模块、面板 props 和 `DesignEditorPage` 动作中使用同名字段；`filterOfficialCatalog` 的 `categoryId` 与编辑器 `officialCategoryId` 都为 `number | null`。
