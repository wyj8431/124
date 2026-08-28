# AI 抠图本地演示版设计

## 目标

在没有真实 AI endpoint/API key 的情况下，让 `/editor/koutu` 可以完成上传、异步处理、结果展示和下载的本地演示，同时保留后续接入真实抠图服务所需的后端 Provider 边界。

## 范围

- 支持 JPEG、PNG、GIF 上传，单文件最大 5 MB。
- 支持单张、批量和拖拽上传。
- 复用现有 `/admin/ai/upload`、`/admin/matting/tasks` API 和 `ai_task` 表。
- 未配置真实 Provider 时，任务自动进入本地 Mock Provider，延迟约 1.2 秒后生成 PNG 结果。
- 本地演示先在浏览器使用 MediaPipe 人像分割生成透明 PNG，再复用后端 Mock Provider 完成任务持久化和下载；仅用于演示，不宣称具备生产级 AI 抠图质量。
- 前端展示上传/处理状态、失败信息、重试、下载透明图、恢复原图和“继续编辑”入口。
- 不新增依赖、不新增表、不暴露 API key、不改变真实 Provider 的请求/响应格式。

## API 契约

### `POST /admin/ai/upload`

请求：`multipart/form-data`，字段 `file`。

约束：

- 文件不能为空。
- 文件大小 `<= 5 * 1024 * 1024` 字节。
- MIME/扩展名必须是 `image/jpeg`、`image/png` 或 `image/gif`。
- 服务端使用 `ImageIO` 验证实际图片内容，不能只信任客户端 MIME。

响应继续使用项目统一 Envelope：

```json
{
  "success": true,
  "data": {
    "url": "http://localhost:8081/uploads/ref-123.png",
    "filename": "ref-123.png"
  }
}
```

### `POST /admin/matting/tasks`

请求：

```json
{ "sourceUrl": "http://localhost:8081/uploads/ref-123.png" }
```

响应：返回 `status=0` 的任务，随后后台异步处理。

### `GET /admin/matting/tasks/{id}`

响应字段：`id`、`status`、`sourceUrl`、`outputUrl`、`errorMsg`、`createTime`、`finishTime`。

状态：`0=处理中`、`1=成功`、`2=失败`。查询必须按当前登录用户过滤任务归属。

## Provider 边界

新增 `MattingProvider` 接口，方法为 `process(String sourceUrl)`。真实 HTTP Provider 继续沿用现有 endpoint、Bearer API key、model 和 `outputUrl/url/b64_json` 解析逻辑；无真实 Provider 时由 `MockMattingProvider` 实现该接口。前端本地演示使用 MediaPipe 的 person segmentation 先生成“仅人物”的透明 PNG，`MattingService` 只负责任务持久化、状态转换和 Provider 选择。

配置：

```yaml
chuangkit:
  ai:
    mock:
      enabled: ${AI_MATTING_MOCK_ENABLED:true}
      delay-ms: ${AI_MATTING_MOCK_DELAY_MS:1200}
```

只要 `AI_PROVIDER_ENDPOINT` 或数据库启用 Provider 可用，就优先走真实服务；两者都不可用时，如果 mock 开关开启则走 Mock，否则按原有失败行为返回安全错误。

## 前端状态与交互

- 上传前在组件边界校验类型和 5 MB 大小，并给出行级错误，不发起无效请求。
- `uploading` 表示文件上传阶段，任务 `status=0` 表示处理中；页面保留轮询并在卡片上显示阶段文案。
- 成功卡片左右展示原图/结果，结果区域使用透明棋盘格；标识“本地演示结果”。
- 下载按钮使用 `download` 属性；“继续编辑”携带结果 URL 跳转到编辑器入口（当前无完整编辑器时打开 `/editor/new?source=...`，不影响下载主流程）。
- 失败卡片展示安全错误文案并提供重试；清理任务时释放 Blob URL。
- 响应式布局覆盖 Chrome/Edge 桌面和移动宽度。

## 安全与错误策略

- 身份从 `SecurityUtils.requireUserId()` 获取，不接受客户端 userId。
- `sourceUrl` 保留长度校验；Mock 只允许读取应用 `uploads` 目录内的文件名，拒绝路径穿越。
- Provider 原始异常只截断后写入任务错误字段，不向前端暴露 API key、堆栈或请求体。
- 上传目录沿用现有本地目录和静态映射；演示生成的 PNG 以随机文件名保存。

## 测试策略

- Java 单测：Mock Provider 生成 PNG、透明化结果、延迟可配置、非法源地址安全失败；保留真实响应解析测试。
- Java 单测：上传大小/类型/内容校验（通过服务方法边界测试）。
- 前端静态行为测试：校验常量、拖拽/类型限制、轮询、演示标识、下载和重试入口。
- 构建验证：`mvn test`、`npm test`、`npm run build`、仓库质量门禁和 Codex 代码审查。

## 明确不做

- 不引入第三方抠图 SDK、图像处理依赖或真实外部服务。
- 不声称 Mock 结果等同于生产 AI 质量。
- 不修改数据库 Schema 或生产配置密钥。
