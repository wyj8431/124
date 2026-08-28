# 编辑器图片编辑面板切换交付记录

## Scope

- 请求：在左侧“图片”素材面板添加图片后，同一区域切换为第二张参考图所示的“图片编辑”面板，并让面板操作真实生效。
- 范围：图片素材添加/选择后的面板切换、关闭恢复素材列表、替换图片、设为背景、滤镜、调整、裁剪、旋转、翻转、圆角、描边、投影、透明度、位置尺寸和图层顺序。
- 约束：继续使用本地素材与既有保存、撤销、协作和导出路径，不新增官网运行时请求或未实现的 AI 服务。

## Delivered Behavior

- 左侧 `image` 工具在选中图片图层时渲染 `图片编辑`，关闭后恢复图片素材列表。
- 点击图片素材、上传图片或提交图片地址后自动选中新增图片并切换面板；点击画布中的图片也会进入编辑面板。
- 图片编辑状态规范化后写入 `CanvasDocument`，画布预览和 PNG/JPEG 导出共用同一滤镜与裁剪数据。
- “黑白”等滤镜、亮度/对比度/饱和度/模糊、裁剪比例、旋转/翻转、圆角/描边/投影、透明度、位置尺寸和图层顺序均连接到真实更新回调。

## Changed Files And Risk Boundary

- 新增：`frontend/src/components/editor/ImageEditPanel.tsx`、`frontend/src/modules/editor/imageEditState.mjs`、`frontend/src/modules/editor/imageEditState.d.mts`、`frontend/test/editor-image-edit-panel.test.mjs`。
- 修改：`frontend/src/pages/DesignEditorPage.tsx`、`frontend/src/utils/exportCanvasDocument.ts`、`frontend/src/index.css`。
- 风险等级：中。改动触及编辑器图层状态、画布渲染和导出，但保持已有文档序列化、保存、撤销、协作与分享接口不变。
- 工程标准：未改变 `docs/engineering/ai-code-standard.md` 所定义的工程策略，无需更新。

## Verification Evidence

| Check | Result | Evidence |
| --- | --- | --- |
| 图片编辑聚焦测试 | PASS | `node --test test/editor-image-edit-panel.test.mjs`：4 passed, 0 failed。 |
| 前端全量测试 | PASS | `npm test`：102 passed, 0 failed。 |
| 前端生产构建 | PASS | `npm run build`：exit 0；仅有既有 Vite 配置和分包体积警告。 |
| 仓库质量门禁 | PASS | `pwsh -File scripts/quality-gate.ps1`：最终输出 `QUALITY GATE PASSED`；治理、前端、管理端构建和后端 Maven 测试均通过。首次运行因 5173 开发服务占用 `lightningcss` 原生文件而在依赖安装阶段出现 EPERM；停止该临时服务后完整重跑通过。 |
| Changed-files 代码审查 | PASS | `node scripts/codex-code-review.mjs --scope changed-files --format json`：0 high、0 medium；仅有 6 条 info 级“缺少附近聚焦测试”提示，且本次已有 `editor-image-edit-panel.test.mjs` 覆盖核心契约。 |
| 浏览器交互回归 | PASS | `http://127.0.0.1:5173/editor/905`：点击左侧图片素材后同一区域出现“图片编辑”；点击“滤镜→黑白”后图片计算样式为 `brightness(1) contrast(1.12) saturate(0) blur(0px)`；点击“关闭图片编辑”后恢复图片素材浏览界面。截图：`.playwright-mcp/editor-image-edit-panel.png`。 |

## Residual Risk

- 当前图片编辑面板以本地素材和 Canvas 图层为边界，不等同官网的会员授权、云端素材或完整 AI 编辑服务。
- 浏览器回归使用开发预览设计 `/editor/905`，未覆盖真实后端持久化网络故障场景；已有保存、撤销和协作测试继续作为回归保障。
