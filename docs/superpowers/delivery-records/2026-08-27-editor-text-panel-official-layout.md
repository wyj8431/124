# 编辑器文字与图片面板官网式布局交付记录

## Scope

- Request: 将编辑器“文字”和“图片”侧栏调整为官网参考图中的信息层次、缩略图密度和交互效果。
- In scope: 文字快捷入口、AI 文案入口、本地艺术字搜索与主题分组；图片上传/地址入口、搜索、标签、图片分组和横向预览；桌面宽侧栏、900px 紧凑布局和现有画布插入流程。
- Out of scope: 登录官网、运行时抓取官网素材、同步私有素材、改变图层序列化或其他资源面板。

## Delivered Behavior

- 新增 `TextResourcePanel`，仅消费本地 `OfficialResource` 分组和现有选择回调。
- 文字面板提供“标题”“副标题”“正文”“竖排文字”“特效文字”五个快捷动作；“AI 文案”入口切换到现有 AI 工具。
- 搜索匹配本地标题、场景名和分类名；无匹配时显示“当前没有匹配的文字素材”。
- 文字资源按“变形标题”“特效文字”“节日热点”“国风主题”“热门文字”展示。每组默认最多三张无可见标题的缩略图；“全部”只展开当前分组，随后可“收起”。
- 点击缩略图仍通过 `addOfficialResource(resource)` 插入本地图片图层。
- 新增 `ImageResourcePanel`，保留上传图片和粘贴图片地址能力，增加“搜索图片”、六个分类标签及图片分组；默认显示三张横向预览，展开后为两列网格。
- 图片面板排除艺术字场景 `459`，点击普通图片和背景资源仍通过现有图片图层插入路径。
- 文字/图片工具在桌面端使用 `520px` 侧栏（内容列约 `447px`），让官网式控件和缩略图不被压缩；`1100px` 以下回退到既有 `310px` 布局。
- 900px 以下保留工具栏和侧栏的稳定轨道，文字缩略图继续为三列。

## Changed Files And Risk Boundary

- Files: `frontend/src/components/editor/TextResourcePanel.tsx`; `frontend/src/components/editor/ImageResourcePanel.tsx`; `frontend/src/pages/DesignEditorPage.tsx`; `frontend/src/index.css`; `frontend/test/editor-official-catalog.test.mjs`。
- Risk classification: low. 改动限制在文字侧栏展示和交互；资源继续来自本地目录，插入、保存和撤销路径未改变。
- Engineering standard: 未改变工程策略，`docs/engineering/ai-code-standard.md` 无需修改。

## Verification Evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Text/image panel regression | PASS | `node --test test/editor-official-catalog.test.mjs`: 16 passed, 0 failed。 |
| Frontend lint | PASS | `npm run lint`: exit 0；10 条既有 Fast Refresh 和 Hook 依赖警告。 |
| Full frontend tests | PASS | `npm test`: 82 passed, 0 failed。 |
| Frontend production build | PASS | `npm run build`: exit 0；Vite 保留既有 `__dirname` 与大分包警告。 |
| Changed-file review | PASS | `node scripts/codex-code-review.mjs --scope changed-files --format json`: 0 high、0 medium；完整质量门禁内的复跑为 0 findings。 |
| Repository quality gate | PASS | `pwsh -File scripts/quality-gate.ps1`: exit 0，最终输出 `QUALITY GATE PASSED`；治理 18 项、前端 82 项、管理端构建和后端 Maven 测试均通过。首次运行因本工作区 Vite 服务占用 `lightningcss` 原生文件而在 `npm ci` 中断；停止该临时服务后完整重跑通过。 |
| Browser visual and interaction smoke test | PASS | 在开发预览 `/editor/869?preview=1` 注入本地 `demo` 演示登录态后验证：桌面工具面板内容宽 `447px`；文字快捷动作使图层数 `0 -> 1`，撤销恢复 `0`；AI 文案切换到“AI工具”；图片“科技”标签只显示“科技创意”组；图片卡片使图层数 `0 -> 1`，撤销恢复 `0`；`900px` 下侧栏 `310px`、展开图片网格为两列且无横向溢出。截图：`C:\Users\魏宇杰\AppData\Local\Temp\codex-editor-text-panel-wide.png`、`C:\Users\魏宇杰\AppData\Local\Temp\codex-editor-image-panel-wide.png`、`C:\Users\魏宇杰\AppData\Local\Temp\codex-editor-image-panel-900.png`。 |

## Residual Risk

- 分类依赖本地目录快照中的标题关键字，而非官网实时分类；新增或重命名素材会归入“热门文字”或“插画精选”，直到开发者调整关键词或重新同步目录。
- 本地预览素材是扁平图片图层，不等同于官网中的可编辑组合元素或其实时授权状态。

## Add Panel And Sidebar Follow-up

### Delivered Behavior

- 新增 `EditorAddPanel`，按“图片/视频、文字、形状、组件、工具”五个分区展示可执行的添加操作，并继续使用既有上传、图层创建和工具切换回调。
- 新增本地 `addPanelCatalog` 和共享 `drawShape` 绘制契约，支持矩形、三角形、圆形、圆角矩形、直角三角形与星形；画布预览和 Canvas 导出共用该契约，既有矩形和圆形图层仍兼容。
- 侧边栏的背景、组件和画笔入口分别使用 `PanelTop`、`Boxes` 与 `Paintbrush` 图标，并让“添加”使用已有的宽资源面板轨道及 900px 紧凑布局。
- 为文字面板的 `fonts` 必填属性同步静态契约测试。字体清单仍由页面的 `LICENSED_FONTS` 提供，面板只渲染传入数据，避免重复维护字体名称。

### Verification Evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Add-panel catalog and interaction regression | PASS | `node --test test/editor-add-panel.test.mjs`: 3 passed, 0 failed。 |
| Shape export and editor regression | PASS | `node --test test/design-editor-realtime.test.mjs`: 10 passed, 0 failed。 |
| Text resource contract | PASS | `node --test test/editor-official-catalog.test.mjs`: 16 passed, 0 failed。 |
| Licensed font catalog | PASS | `node --test test/font-catalog.test.mjs`: 3 passed, 0 failed。 |
| Browser visual smoke | PASS | 1440px 和 900px 下五个添加分区均可见且无横向溢出；标题和三角形可创建图层并由撤销恢复。截图：`C:\Users\魏宇杰\AppData\Local\Temp\codex-editor-add-authenticated-1440.png`、`C:\Users\魏宇杰\AppData\Local\Temp\codex-editor-add-authenticated-900.png`、`C:\Users\魏宇杰\AppData\Local\Temp\codex-editor-add-tools-1440.png`。 |

### Risk Boundary

- 新增的形状是本地编辑器图层，不请求官网或第三方素材，也不声明任何会员、限免或授权状态。
- 组件和工具卡片只导航到已有本地工具；上传、保存、撤销和资源插入 API 均未改变。

## Resizable Sidebar And Canvas Follow-up

### Delivered Behavior

- 编辑器左侧工具侧栏新增右侧、底部和右下角拖拽热区，可独立调整宽度、高度或同时调整；宽度/高度保存在当前浏览器的 `localStorage`。
- 侧栏最小尺寸为 `240px` 宽、`240px` 高；`1100px` 以下恢复既有 `310px` 轨道，`900px` 以下隐藏桌面拖拽热区并保留紧凑布局。
- 白色设计画板新增右下角宽高拖拽热区，按当前缩放比例换算画布坐标；拖拽过程实时广播文档更新，释放时只写入一条撤销记录。
- “画布属性”面板新增 `宽度`、`高度` 数字输入，统一通过 `CanvasDocument`、自动保存、协作和导出路径生效；尺寸限制为 `200..8000px`。

### Verification Evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Resizing regression | PASS | `node --test test/design-editor-realtime.test.mjs`: 10 passed, 0 failed。 |
| Full frontend tests | PASS | `npm test`: 87 passed, 0 failed。 |
| Frontend lint | PASS | `npm run lint`: exit 0；仅保留项目已有的 Fast Refresh 与 Hook 依赖警告。 |
| Frontend build | PASS | `npm run build`: exit 0；仅保留 Vite `__dirname` 与大分包提示。 |
| Changed-file review | PASS | `node scripts/codex-code-review.mjs --scope changed-files --format json --severity medium`: 0 high、0 medium。 |
| Repository quality gate | PASS | `pwsh -File scripts/quality-gate.ps1`: exit 0，最终输出 `QUALITY GATE PASSED`；治理、前端、管理端和后端检查均通过。 |
| Browser smoke | PARTIAL | 本地 `5173` 与 `8081` 均返回 `200`；共享 Playwright MCP 用户目录被其他会话占用，无法建立独立页面会话，因此未将拖拽交互冒充为已完成的浏览器验证。 |

### Risk Boundary

- 侧栏尺寸是浏览器级 UI 偏好，不会写入设计数据；清除站点存储后恢复默认宽度和高度。
- 画布尺寸是设计数据，调整后会进入保存、协作广播、版本历史和导出结果；调整尺寸不会自动缩放或裁剪已有图层。
