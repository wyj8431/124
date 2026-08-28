# AI Matting Local Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 AI 抠图页面在没有真实 Provider 时通过后端 Mock Provider 完成可运行的上传、异步处理、结果下载演示，并保留真实服务替换接口。

**Architecture:** 复用现有 `ai_task` 持久化和 `/admin/matting/tasks` 轮询 API。`MattingService` 选择配置的 HTTP Provider 或 `MockMattingProvider`；Mock 使用 JDK ImageIO 生成本地透明 PNG。前端在现有页面状态机上补齐校验、进度、演示标识、重试、恢复原图和继续编辑入口。

**Tech Stack:** Spring Boot 3.2 / Java 21 / MyBatis-Plus / H2 dev DB；React 19 / TypeScript / Vite / Lucide；Node built-in test runner。

---

### Task 1: 固化契约文档

**Files:**
- Create: `docs/superpowers/specs/2026-08-25-ai-matting-design.md`
- Create: `docs/superpowers/plans/2026-08-25-ai-matting-local-demo.md`

- [x] **Step 1: 记录 API、Provider、状态、安全和测试契约**

完成设计文档，明确不改 Schema、真实 Provider 优先、Mock 默认开启、上传限制和用户隔离。

- [x] **Step 2: 记录按文件拆分的实现任务**

本计划按后端 Provider、上传校验、前端交互、测试和验证分任务执行。

### Task 2: 新增可替换的 Mock Provider

**Files:**
- Create: `backend/src/main/java/com/chuangkit/admin/service/MattingProvider.java`
- Create: `backend/src/main/java/com/chuangkit/admin/service/MockMattingProvider.java`
- Modify: `backend/src/main/resources/application.yml`
- Test: `backend/src/test/java/com/chuangkit/admin/service/MockMattingProviderTest.java`

- [x] **Step 1: 写失败测试**

使用临时目录写入一张带纯色背景的 `BufferedImage`，调用 `new MockMattingProvider(tempDir, "http://localhost:8081/uploads", 0).process(sourceUrl)`，断言返回 URL 指向 `matting-mock-*.png`，文件存在，输出类型为 PNG，四角 alpha 为 0 且中心像素仍不透明。

- [x] **Step 2: 运行后端聚焦测试确认失败**

运行 `./mvnw -q -Dtest=MockMattingProviderTest test`，预期因类和方法尚不存在而失败。

- [x] **Step 3: 实现接口和 Mock Provider**

`MattingProvider` 定义 `String process(String sourceUrl) throws Exception`。`MockMattingProvider` 注入 `chuangkit.upload.base-url`、`user.dir/uploads`、`chuangkit.ai.mock.delay-ms`；处理时先等待配置延迟，再从 URL 最后一个路径段解析上传文件，拒绝 `..` 和目录外路径；用 ImageIO 读取图片，取四角平均色，按 RGB 距离生成 alpha，保留中心主体，保存随机 PNG 文件并返回静态上传 URL。读取或写入失败抛出安全异常。

- [x] **Step 4: 运行测试确认通过**

运行同一命令，预期测试通过。

### Task 3: 接入任务服务并保留真实 Provider

**Files:**
- Modify: `backend/src/main/java/com/chuangkit/admin/service/MattingService.java`
- Modify: `backend/src/test/java/com/chuangkit/admin/service/MattingServiceTest.java`

- [x] **Step 1: 写 Provider 选择和失败路径测试**

补充可测试的 Provider 选择辅助方法测试：有配置 endpoint 时不返回 Mock；无 endpoint 且 mock 开启时允许 Mock；mock 关闭且无真实 Provider 时抛出原有安全错误。保留 `outputUrl`、`url`、`b64_json` 三种响应解析测试。

- [x] **Step 2: 实现最小接入**

给 `MattingService` 注入 `MockMattingProvider`，将异步 `processAsync` 的 Provider 分支改为：配置 endpoint/数据库 Provider 时调用现有 HTTP 方法；无 Provider 时调用 Mock（配置开启），并写入成功状态、完成时间和输出 URL；异常统一截断到 500 字符。保留 `get` 的 userId 条件和现有任务写入结构。

- [x] **Step 3: 运行服务单测**

运行 `./mvnw -q -Dtest=MattingServiceTest,MockMattingProviderTest test`，预期全部通过。

### Task 4: 收紧上传边界

**Files:**
- Modify: `backend/src/main/java/com/chuangkit/admin/service/AiGenerateService.java`
- Modify: `backend/src/test/java/com/chuangkit/admin/service/AiGenerateServiceTest.java`

- [x] **Step 1: 写失败测试**

补充 `upload` 的大于 5MB、非 JPEG/PNG/GIF、内容不是图片三类测试，断言抛出 `BusinessException`；补充合法 PNG 可成功写入并返回 URL 的测试。

- [x] **Step 2: 实现校验**

在写文件前检查空文件、大小上限、扩展名/MIME 白名单，并使用 ImageIO 验证内容；扩展名统一为安全白名单后再生成随机文件名，避免路径穿越。保留现有返回结构。

- [x] **Step 3: 运行上传测试**

运行 `./mvnw -q -Dtest=AiGenerateServiceTest test`，预期上传边界和既有 AI 生成测试通过。

### Task 5: 完善前端上传和任务状态

**Files:**
- Modify: `frontend/src/data/koutuPageData.ts`
- Modify: `frontend/src/components/koutu/KoutuUploadPanel.tsx`
- Modify: `frontend/src/pages/KoutuEditorPage.tsx`
- Modify: `frontend/src/styles/koutu-editor.css`
- Modify: `frontend/test/koutu-editor.test.mjs`

- [x] **Step 1: 写失败静态行为测试**

断言页面源代码包含 `5 * 1024 * 1024` 校验、`image/gif`、Mock 演示文案、下载、重试和继续编辑入口；上传面板包含拖拽状态和错误消息渲染。

- [x] **Step 2: 实现上传校验和状态反馈**

在上传面板集中校验文件类型和大小，通过 `onError` 回传行级错误；accept 增加 GIF；批量上传逐个过滤无效文件。页面增加 uploading 文件集合、上传进度文案、任务状态文案和演示结果提示；失败时保留可重试任务。

- [x] **Step 3: 实现结果操作**

成功卡片增加结果/原图切换展示、下载透明图、恢复原图和继续编辑按钮；继续编辑使用结果 URL 构造导航地址；组件卸载时释放 Blob URL。

- [x] **Step 4: 补响应式和可访问性样式**

保持现有 CSS 类和 Lucide 图标，增加拖拽提示、进度条、状态徽标、按钮 focus 样式和移动端单列布局，不引入新依赖。

- [x] **Step 5: 运行前端测试和构建**

运行 `npm test -- --test-name-pattern=koutu` 与 `npm run build`，预期通过。

### Task 6: 文档、质量门禁和本地演示

**Files:**
- Modify: `docs/engineering/ai-code-standard.md`（仅在标准受影响时补充 Mock Provider/Provider 切换约束）
- Create: `docs/superpowers/delivery-records/2026-08-25-ai-matting-local-demo.md`

- [x] **Step 1: 更新交付记录**

记录范围、未改 Schema、Mock 开关、真实 Provider 替换方式、测试和剩余风险。

- [x] **Step 2: 运行完整验证**

依次运行：

```powershell
cd backend; ./mvnw -q test
cd ../frontend; npm test
npm run build
cd ..; pwsh -File scripts/quality-gate.ps1
node scripts/codex-code-review.mjs --scope changed-files --format json
```

修复所有 high/medium 审查项后重新运行审查。

- [x] **Step 3: 启动本地服务验证演示入口**

启动后端 `./mvnw spring-boot:run` 和前端 `npm run dev -- --host 127.0.0.1`（若端口被占用则使用备用端口），确认 `/editor/koutu` 可打开；无真实 Provider 时任务最终成功并显示“本地演示结果”。

- [x] **Step 4: 完成交付自检**

检查 `git diff` 只包含本次文件，说明未执行 `git add/commit/push`，给出建议提交信息和本地访问地址。
