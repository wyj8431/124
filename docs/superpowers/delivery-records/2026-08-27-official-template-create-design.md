# 官方目录模板创建修复交付记录

## Scope

- Request: 修复从创建设计弹窗选择模板后编辑器显示空白画布的问题。
- In scope: 将官方目录模板的 ID、标题和本地封面路径传入设计创建接口；添加回归测试。
- Explicitly out of scope: 模板资源同步、数据库迁移、将封面拆分为可编辑元素、编辑器渲染重构。

## Design Decisions

- Chosen approach and why: 复用 `DesignService` 对官方目录模板的既有处理，前端只补齐创建请求所缺失的元数据，改动最小且保持 API 兼容。
- Alternatives considered and rejected: 将模板写入本地模板库或在编辑器加载时补图会扩大数据和渲染职责，未采用。

## Changed Files And Risk Boundary

- Files: `frontend/src/components/create-design/CreateDesignModal.tsx`; `frontend/test/create-design-catalog.test.mjs`; 设计说明、实施计划和本记录。
- Risk classification: low. 仅增加可选 API 请求字段；自定义尺寸和本地模板创建流程不变。

## Verification

| Command | Result | Notes |
| --- | --- | --- |
| `npm test -- test/create-design-catalog.test.mjs` | PASS | 新回归测试先失败，修复后 79/79 通过。 |
| `npm run lint` | PASS | 存在未触及文件的既有 Fast Refresh 和 Hooks 警告。 |
| `npm run build` | PASS | 存在既有 Vite 配置与分包大小警告。 |
| `node scripts/codex-code-review.mjs --scope changed-files --format json` | PASS | 0 个 high/medium finding。 |
| `pwsh -File scripts/quality-gate.ps1` | PASS | 重启前端后完成；治理、前端、管理端和后端测试均通过。 |

## Post-Merge Regression Repair

- Symptom: 合并到 Windows 工作区后，`editor-official-catalog.test.mjs` 将 CSS 源文件限定为 LF 换行，导致 Figma 编辑器 900px 响应式区块的既有断言误报失败。
- Root cause: Git 索引中的 CSS 为 LF，但本机工作区按 `core.autocrlf` 检出为 CRLF；实际 CSS 规则和响应式布局均未丢失。
- Fix: 测试读取 CSS 后统一 CRLF 为 LF，再验证原有的 900px 工具面板和检查器布局规则。
- Risk: low. 仅使源码断言跨平台，未改动运行时样式或模板创建逻辑。
- Verification: `node --test frontend/test/editor-official-catalog.test.mjs` passed 12/12; `pwsh -File scripts/quality-gate.ps1` completed with 79/79 frontend tests, fresh frontend/admin build artifacts, and backend Surefire reports with no failures or errors; `node scripts/codex-code-review.mjs --scope changed-files --format json` reported 0 findings.

## Residual Risk And Unverified Work

- External integrations not verified: 未调用远程创客贴编辑器；使用本地已同步封面文件。
- Follow-up risk: 官方目录中的封面仍是单一图片图层，而非可独立编辑的文字和图形元素。

## Post-Merge Resize Handle Repair

- Symptom: 在适应画布的低缩放比例（32%）下，官网公开艺术字图层的缩放手柄过小或被裁切，右侧手柄无法点击，导致用户不能调整图层大小。
- Root cause: 通用 `.design-editor-layer span` 规则覆盖了手柄的固定宽度；同时图层的 `overflow: hidden` 裁掉了位于右侧边界外的手柄。
- Fix: 对手柄使用更高优先级的层内选择器；按画布缩放的倒数放大手柄，保持 9px 屏幕命中区域；仅在图层选中时允许手柄溢出。
- Risk: low. 仅影响选中状态下的非画笔图层控制柄，未改变图层持久化数据、拖动计算或资源插入流程。
- Verification: 回归用例先在缺少样式规则时失败，修复后 `node --test test/design-editor-realtime.test.mjs` 8/8 通过；Playwright 在 32% 缩放下确认四个手柄均为 9×9px 且命中自身，右下角拖动将图层从 413×302 调整为 488×352；`npm run lint`、`npm run build`、变更审查均通过，`pwsh -File scripts/quality-gate.ps1` 以 `QUALITY GATE PASSED` 结束。

## Expired Session Create Repair

- Symptom: 已显示登录状态的用户在创建设计时，前端将 `401` 错误笼统提示为“请确认后端已启动并已登录”。
- Root cause: 创建弹窗的异常分支未区分接口错误；当访问令牌和刷新令牌均已过期时，后端正确返回 `401`，但前端丢弃了错误码和服务端消息。
- Fix: 对 `ApiError` 的 `401` 响应清理失效会话后打开登录窗口，并提示用户重新登录；其他失败场景保留服务端的具体错误信息。
- Risk: low. 仅调整创建弹窗的错误反馈和登录引导，不影响已登录用户的创建请求、设计数据或后端接口。
- Verification: Playwright 确认过期会话的 `POST /admin/designs` 为 `401`、刷新接口返回“登录已过期”，修复后令牌被清除、登录窗口打开并显示准确提示；重新登录后成功创建并进入 `/editor/868`，临时设计已删除。新增回归用例后，`node --test test/create-design-catalog.test.mjs` 21/21 通过；完整质量门禁以 `QUALITY GATE PASSED` 结束。
