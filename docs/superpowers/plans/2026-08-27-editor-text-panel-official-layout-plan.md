# 编辑器文字面板官网式布局 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将编辑器文字侧栏替换为本地素材驱动的官网式搜索、分组和三列预览体验。

**Architecture:** 新建受控的 `TextResourcePanel` 处理搜索输入、分组展示及单组展开状态；`DesignEditorPage` 继续负责从本地目录筛选艺术字、建立稳定主题分组并将点击事件接入现有画布插入函数。样式只新增文字面板专属类，现有通用公开资源面板继续供其他工具使用。

**Tech Stack:** React 19、TypeScript、Vite、现有 Lucide 图标与本地公开目录模块。

**Spec:** `docs/superpowers/specs/2026-08-27-editor-text-panel-official-layout-design.md`

## Global Constraints

- 运行时只读取本地 `/create-design/official/catalog.json` 与本地预览图，禁止新增官网请求。
- 继续通过 `addOfficialResource(resource)` 插入资源，不修改 `CanvasDocument` 或图层数据结构。
- 侧栏在 900px 紧凑断点仍保持稳定的三列卡片轨道。
- 保留现有用户工作区改动，不触碰与文字面板无关的文件。

---

### Task 1: 覆盖文字资源分组与搜索契约

**Files:**
- Modify: `frontend/test/editor-official-catalog.test.mjs`
- Test: `frontend/test/editor-official-catalog.test.mjs`

**Interfaces:**
- Consumes: 本地 `OfficialResource`，其中艺术字资源满足 `kind === 'asset' && sceneId === 459`。
- Produces: 对 `TextResourcePanel` 和 `DesignEditorPage` 的静态回归断言。

- [ ] **Step 1: 写入失败的文字面板回归测试**

在 `text panel exposes exactly the local public art-text scene as image layers` 之后新增测试，读取新组件、编辑器页面和样式文件，断言新的受控接口、主题标签、搜索和三列网格存在：

```js
test('text panel groups local art text behind search and per-group expansion', async () => {
  const [panelSource, editorSource, styles] = await Promise.all([
    readFile(new URL('../src/components/editor/TextResourcePanel.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/DesignEditorPage.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/index.css', import.meta.url), 'utf8'),
  ])

  assert.match(panelSource, /placeholder="搜索文字"/)
  assert.match(panelSource, /推荐文字/)
  assert.match(panelSource, /节日活动/)
  assert.match(panelSource, /国风主题/)
  assert.match(panelSource, /趣味标题/)
  assert.match(panelSource, /resources\.slice\(0, 3\)/)
  assert.match(panelSource, /全部/)
  assert.match(panelSource, /收起/)
  assert.match(editorSource, /<TextResourcePanel groups=\{textResourceGroups\} onSelect=\{addOfficialResource\} \/>/)
  assert.match(styles, /\.design-editor-text-resource-grid \{ display: grid; grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/)
})
```

- [ ] **Step 2: 运行聚焦测试并确认失败**

Run: `node --test test/editor-official-catalog.test.mjs`

Expected: FAIL，因为 `TextResourcePanel.tsx` 尚不存在，新的搜索、分组和三列网格断言无法满足。

- [ ] **Step 3: 不修改现有素材面板测试**

确认已有 `official resource panel exposes local preview cards and accessible buttons` 测试保持不变；该测试是 `OfficialResourcePanel` 仍被其他素材工具复用的回归边界。

- [ ] **Step 4: 提交测试契约**

```bash
git add frontend/test/editor-official-catalog.test.mjs
git commit -m "test(editor): cover grouped text resource panel"
```

### Task 2: 实现本地分组文字资源面板

**Files:**
- Create: `frontend/src/components/editor/TextResourcePanel.tsx`
- Modify: `frontend/src/index.css`
- Test: `frontend/test/editor-official-catalog.test.mjs`

**Interfaces:**
- Consumes: `TextResourceGroup[]`，每组含 `id: string`、`title: string` 和 `resources: OfficialResource[]`；`onSelect(resource: OfficialResource): void`。
- Produces: `TextResourcePanel({ groups, onSelect })`，供编辑器文字工具渲染。

- [ ] **Step 1: 创建受控的资源分组类型和组件壳**

在新组件导出以下类型和函数。使用 `useMemo` 和 `useState`，将搜索值及展开组保留在组件内部：

```tsx
export type TextResourceGroup = {
  id: string
  title: string
  resources: OfficialResource[]
}

type TextResourcePanelProps = {
  groups: TextResourceGroup[]
  onSelect: (resource: OfficialResource) => void
}

export function TextResourcePanel({ groups, onSelect }: TextResourcePanelProps) {
  const [query, setQuery] = useState('')
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null)
  const visibleGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return groups
      .map((group) => ({
        ...group,
        resources: group.resources.filter((resource) =>
          !normalizedQuery || `${resource.title} ${resource.sceneName} ${resource.categoryName}`
            .toLocaleLowerCase()
            .includes(normalizedQuery),
        ),
      }))
      .filter((group) => group.resources.length > 0)
  }, [groups, query])

  return (
    <section className="design-editor-text-resource-panel" aria-label="文字素材">
      <label className="design-editor-text-search">
        <Search className="h-4 w-4" aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索文字" />
      </label>
      {visibleGroups.length ? visibleGroups.map((group) => {
        const expanded = expandedGroupId === group.id
        const resources = expanded ? group.resources : group.resources.slice(0, 3)
        return (
          <section key={group.id} className="design-editor-text-resource-section" aria-label={group.title}>
            <div className="design-editor-text-resource-heading">
              <strong>{group.title}</strong>
              {group.resources.length > 3 ? <button type="button" onClick={() => setExpandedGroupId(expanded ? null : group.id)}>{expanded ? '收起' : '全部'}</button> : null}
            </div>
            <div className="design-editor-text-resource-grid">
              {resources.map((resource) => <button key={resource.id} type="button" className="design-editor-text-resource-card" aria-label={`${group.title}：${resource.title}`} onClick={() => onSelect(resource)}><span className="design-editor-text-resource-preview"><img src={resource.previewPath} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true }} /></span><span>{resource.title}</span></button>)}
            </div>
          </section>
        )
      }) : <p className="design-editor-official-empty">当前没有匹配的文字素材</p>}
    </section>
  )
}
```

- [ ] **Step 2: 过滤标题、场景与分类，并限制默认展示数量**

在组件内生成 `visibleGroups`。将查询值转为小写，匹配每条资源的 `title`、`sceneName` 和 `categoryName`；忽略资源为空的分组。每组根据 `expandedGroupId === group.id` 选择全量资源或 `resources.slice(0, 3)`，且仅当数量大于 3 时显示展开按钮：

```tsx
const visibleGroups = useMemo(() => {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  return groups
    .map((group) => ({
      ...group,
      resources: group.resources.filter((resource) =>
        !normalizedQuery || `${resource.title} ${resource.sceneName} ${resource.categoryName}`
          .toLocaleLowerCase()
          .includes(normalizedQuery),
      ),
    }))
    .filter((group) => group.resources.length > 0)
}, [groups, query])
```

每张卡片是 `button`，其 `aria-label` 为 ``${group.title}：${resource.title}``，点击时调用 `onSelect(resource)`；预览图使用 `loading="lazy"` 并在加载失败时隐藏。

- [ ] **Step 3: 添加文字面板专属样式**

在 `frontend/src/index.css` 的编辑器资源面板样式附近添加以下规则，避免覆盖 `OfficialResourcePanel`：

```css
.design-editor-text-search { display: flex; align-items: center; gap: 8px; height: 38px; padding: 0 10px; border: 1px solid #e4e9f1; border-radius: 7px; color: #61708b; background: #f7f9fc; }
.design-editor-text-search input { min-width: 0; flex: 1; border: 0; outline: 0; color: #344054; background: transparent; font: inherit; font-size: 13px; }
.design-editor-text-resource-section { padding: 18px 0 0; }
.design-editor-text-resource-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.design-editor-text-resource-heading strong { color: #344054; font-size: 13px; }
.design-editor-text-resource-heading button { border: 0; padding: 0; color: #738099; background: transparent; font: inherit; font-size: 11px; cursor: pointer; }
.design-editor-text-resource-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.design-editor-text-resource-card { min-width: 0; border: 0; padding: 0; color: #61708b; background: transparent; font: inherit; font-size: 10px; text-align: left; cursor: pointer; }
.design-editor-text-resource-preview { display: grid; overflow: hidden; place-items: center; aspect-ratio: 1; border-radius: 6px; background: #f3f6fb; }
.design-editor-text-resource-preview img { display: block; width: 100%; height: 100%; object-fit: cover; }
.design-editor-text-resource-card > span:not(.design-editor-text-resource-preview) { display: block; overflow: hidden; margin-top: 4px; text-overflow: ellipsis; white-space: nowrap; }
```

添加 `:hover` 和 `:focus-visible` 规则以匹配现有蓝色交互反馈；搜索无命中时渲染 `当前没有匹配的文字素材`。

- [ ] **Step 4: 运行聚焦测试并确认通过**

Run: `node --test test/editor-official-catalog.test.mjs`

Expected: PASS，包含原有公开资源筛选测试与新的文字面板结构测试。

- [ ] **Step 5: 提交面板组件**

```bash
git add frontend/src/components/editor/TextResourcePanel.tsx frontend/src/index.css frontend/test/editor-official-catalog.test.mjs
git commit -m "feat(editor): group local text resources"
```

### Task 3: 将文字工具接入新面板和本地主题分组

**Files:**
- Modify: `frontend/src/pages/DesignEditorPage.tsx`
- Modify: `frontend/test/editor-official-catalog.test.mjs`
- Test: `frontend/test/editor-official-catalog.test.mjs`

**Interfaces:**
- Consumes: `TextResourcePanel` 和 `TextResourceGroup`，以及既有 `officialArtTextResources`、`addOfficialResource`。
- Produces: 文字工具中官网式分组面板，且卡片点击继续创建本地图片图层。

- [ ] **Step 1: 写入编辑器接入失败断言**

在 Task 1 的测试中补充断言，要求编辑器导入组件、建立 `textResourceGroups`，且不再在 `activeTool === 'text'` 分支渲染 `标题`、`副标题`、`正文`快捷网格：

```js
assert.match(editorSource, /import \{ TextResourcePanel, type TextResourceGroup \} from '@\/components\/editor\/TextResourcePanel'/)
assert.match(editorSource, /const textResourceGroups = useMemo<TextResourceGroup\[\]>\(/)
assert.match(editorSource, /<TextResourcePanel groups=\{textResourceGroups\} onSelect=\{addOfficialResource\} \/>/)
assert.doesNotMatch(
  editorSource.match(/\{activeTool === 'text' \?[\s\S]*?\) : null\}/)?.[0] || '',
  /添加文字图层|标题文字|副标题文字|正文内容/,
)
```

- [ ] **Step 2: 运行聚焦测试并确认失败**

Run: `node --test test/editor-official-catalog.test.mjs`

Expected: FAIL，因为编辑器尚未导入或使用新组件。

- [ ] **Step 3: 在编辑器中建立稳定主题分组**

在 `officialArtTextResources` 后新增 `useMemo<TextResourceGroup[]>`。按现有 24 个资源标题建立四个没有重叠的关键词组，并给未命中的资源追加到“趣味标题”，使目录变动时不会丢失本地资源：

```tsx
const textResourceGroups = useMemo<TextResourceGroup[]>(() => {
  const assignedIds = new Set<number>()
  const createGroup = (id: string, title: string, keywords: string[]): TextResourceGroup => {
    const resources = officialArtTextResources.filter((resource) =>
      !assignedIds.has(resource.id) && keywords.some((keyword) => resource.title.includes(keyword)),
    )
    resources.forEach((resource) => assignedIds.add(resource.id))
    return { id, title, resources }
  }
  const groups = [
    createGroup('recommended', '推荐文字', ['小红书', '手写风', '变形标题']),
    createGroup('festival', '节日活动', ['情人节', '年会', '年货节', '新年', '元旦']),
    createGroup('chinese-style', '国风主题', ['中国风', '国潮', '印章']),
  ].filter((group) => group.resources.length > 0)
  const remaining = officialArtTextResources.filter((resource) => !assignedIds.has(resource.id))
  return remaining.length ? [...groups, { id: 'playful', title: '趣味标题', resources: remaining }] : groups
}, [officialArtTextResources])
```

`assignedIds` 会在每个分组生成后立即记录资源 id；因此“国风元旦”等命中多组关键词的资源始终只在先出现的分组中展示。

- [ ] **Step 4: 替换文字工具 JSX**

导入 `TextResourcePanel`。用以下最小分支替换原 `activeTool === 'text'` 中的快捷文字和 `OfficialResourcePanel`：

```tsx
{activeTool === 'text' ? (
  <TextResourcePanel groups={textResourceGroups} onSelect={addOfficialResource} />
) : null}
```

保留 `officialCatalogError` 的现有本地目录不可用提示，放在组件之后。不要改动 `activeTool === 'add'` 的快速文字功能，它仍是“添加”工具的职责。

- [ ] **Step 5: 运行聚焦测试并确认通过**

Run: `node --test test/editor-official-catalog.test.mjs`

Expected: PASS，验证新文字分组、原有本地目录约束和公开资源插入路径。

- [ ] **Step 6: 提交编辑器接入**

```bash
git add frontend/src/pages/DesignEditorPage.tsx frontend/test/editor-official-catalog.test.mjs
git commit -m "feat(editor): align text panel browsing layout"
```

### Task 4: 验证、审查与交付记录

**Files:**
- Create: `docs/superpowers/delivery-records/2026-08-27-editor-text-panel-official-layout.md`
- Modify: `docs/engineering/ai-code-standard.md` only if this implementation changes an engineering policy

**Interfaces:**
- Consumes: 完成的前端面板、现有质量门禁和改动文件审查脚本。
- Produces: 可审计的测试、审查、质量门禁与浏览器验证记录。

- [ ] **Step 1: 运行前端静态验证**

从 `frontend` 依次运行：

```bash
node --test test/editor-official-catalog.test.mjs
npm run lint
npm test
npm run build
```

Expected: 每条命令退出码为 `0`。记录任何不导致失败的既有警告，但不将其记为本次回归。

- [ ] **Step 2: 进行本地浏览器验收**

启动本地开发服务器：

```bash
npm run dev -- --host 127.0.0.1 --port 5174
```

在可编辑设计中打开文字工具，在桌面和 900px 宽视口验证：搜索框可输入；四个分组默认最多显示三张卡；“全部”只展开当前分组；搜索无命中显示空状态；点击一张卡创建本地图片图层。完成后停止本次临时服务器。

- [ ] **Step 3: 审查改动文件并运行仓库质量门禁**

从仓库根目录运行：

```bash
node scripts/codex-code-review.mjs --scope changed-files --format json
pwsh -File scripts/quality-gate.ps1
```

Expected: 审查结果没有 high 或 medium finding，质量门禁以 `QUALITY GATE PASSED` 结束。若出现 high 或 medium finding，修复后重新运行两项命令。

- [ ] **Step 4: 创建交付记录**

使用仓库的交付记录模板创建 `docs/superpowers/delivery-records/2026-08-27-editor-text-panel-official-layout.md`。记录实际命令、退出码、测试计数、浏览器检查结果、审查 JSON 摘要与质量门禁结果。风险段明确写出：分类来自本地快照的标题关键字，素材内容不会随官网实时变化。

- [ ] **Step 5: 提交验证证据**

```bash
git add docs/superpowers/delivery-records/2026-08-27-editor-text-panel-official-layout.md
git commit -m "docs(editor): record text panel layout delivery"
```
