# 海报多人协作编辑工单实现规格

## 目标

围绕“网站学院-All poster 低代码开发平台项目-海报多人协作编辑任务工单”，补齐现有海报编辑器的多人协作闭环：实时事件同步、光标与成员标识、同图层冲突提示与锁定、分享权限、版本保存与恢复、自动保存、图片导出，以及可按需加载的独立协作模块。

## 工单需求映射

| 工单要求 | 现有能力 | 本次交付 |
| --- | --- | --- |
| 文本、图片、背景等实时同步 | 编辑器事件桥接、SSE、BroadcastChannel 已存在 | 严格事件校验、断线重连、远端更新提示保持可见 |
| 光标实时更新且颜色区分 | `cursor` 事件和稳定颜色已存在 | 保持颜色映射，补充事件输入边界和生命周期清理 |
| 同元素冲突检测与解决 | 图层锁事件、保存 revision 乐观锁已存在 | 锁超时清理、远端锁中止本地操作、释放锁兜底 |
| 只读/可编辑分享 | 服务端随机 token、模式校验已存在 | 保持服务端鉴权，前端明确只读行为 |
| 历史版本查看与恢复 | 团队版本 API 和编辑器面板已存在 | 保持版本快照、恢复进撤销栈并自动保存 |
| 定时保存与退出保存 | 30 秒定时器、`beforeunload` 已存在 | 保持并验证清理及冲突保护 |
| PNG/JPEG、分辨率、压缩 | 浏览器 Canvas 导出已存在 | 保持格式、倍率、质量边界及配额保护 |
| 微前端独立模块、模块通信、按需加载 | 协作模块独立目录、React.lazy、事件桥接已存在 | 不引入 qiankun/无界，使用独立模块边界和事件协议覆盖同一验收语义 |

## 范围

### 包含

- `frontend/src/modules/collaboration/collaborationBridge.ts`：事件白名单、SSE 断线退避重连、资源释放。
- `frontend/src/pages/DesignEditorPage.tsx`：远端锁冲突时终止本地拖拽/缩放，离开页面时释放本地锁，沿用已有分享、保存、版本、导出流程。
- `frontend/src/modules/collaboration/CollaborationCanvasSignals.tsx`：继续作为懒加载的协作画布信号组件。
- `backend/src/main/java/com/chuangkit/admin/dto/CollaborationEventRequest.java`：校验协作事件类型。
- `backend/src/main/java/com/chuangkit/admin/service/CollaborationEventBroker.java`：有限 SSE 超时、心跳、订阅清理。
- 前后端聚焦测试、工程交付记录。

### 不包含

- 不新增或修改数据库表、索引、迁移。
- 不新增 qiankun、无界或其他 npm 依赖。
- 不改变已有 REST/SSE 路径、认证方式、分享 token 语义或 `revision` 乐观锁语义。
- 不把浏览器端事件广播当作服务端授权；服务端继续验证设计和团队成员关系。

## 架构与边界

### 前端模块

`DesignEditorPage` 负责画布局部状态、编辑动作和服务端 Query/Mutation 编排；`collaborationBridge` 只负责协作事件的发布、订阅和传输，不持有 React 状态；`CollaborationCanvasSignals` 只负责渲染远端光标与锁提示。协作画布组件通过 `React.lazy` 按需加载，未打开编辑器时不加载。

浏览器内优先使用 `BroadcastChannel`，不支持时退回同源 `storage` 事件；存在认证 token 时同时连接服务端 SSE，并通过 POST 发布事件。浏览器通道用于低延迟同源标签页同步，服务端通道用于团队成员跨设备同步。

### 后端模块

`CollaborationEventController` 继续执行身份认证和设计所属团队校验；`CollaborationEventRequest` 负责请求类型边界校验；`CollaborationEventBroker` 负责每个设计频道的订阅列表、SSE 心跳、发送失败清理和有限连接生命周期。事件不落库，持久化设计内容继续使用 `DesignService.save` 的 revision 乐观锁，评论/版本/成员状态继续使用现有团队服务。

## 事件契约

事件通道：`poster-collaboration:{designId}`。

允许的 `type`：`cursor`、`document-update`、`layer-lock`、`layer-unlock`、`presence`。

浏览器内部事件结构：

```ts
interface CollaborationEvent<T = unknown> {
  channel: 'poster-collaboration'
  designId: number
  type: 'cursor' | 'document-update' | 'layer-lock' | 'layer-unlock' | 'presence'
  actor: { id: string; name: string; color: string }
  payload: T
  sentAt: number
}
```

服务端 POST 请求结构：

```json
{
  "type": "layer-lock",
  "payload": { "layerId": "layer-123", "actorColor": "#0f8bff" }
}
```

服务端只接受白名单事件类型；身份字段由 token 派生，不信任客户端传入的 actor id/name。SSE `data` 是 JSON 编码的事件 DTO，连接建立时发送 `ready`/`connected`，业务事件使用 `collaboration` event name。

## 冲突策略

1. 拖拽或缩放开始前检查 `layerLocks`；锁属于其他 actor 时不开始操作并展示“请稍候”提示。
2. 本地开始操作后发布 `layer-lock`，结束、取消、组件卸载和页面离开均发布 `layer-unlock`。
3. 每把锁在前端按最近事件时间维护，超过 30 秒没有续租事件即视为过期并清理，避免异常关闭留下永久锁。
4. 本地操作期间收到其他 actor 的同图层锁时，立即清空拖拽/缩放引用，释放指针捕获，保留当前已提交的最后状态，并提示冲突。后续编辑必须重新获取锁。
5. 文档保存继续使用 `revision` 条件更新；服务端返回 409 时暂停 autosave，保留本地草稿，用户选择重新加载最新版本或查看版本历史。

## SSE 生命周期与安全

- 每个 `SseEmitter` 使用 30 分钟有限超时，不允许无限连接。
- Broker 为每个订阅建立 25 秒心跳任务，发送 SSE comment/heartbeat；发送异常、完成、超时或错误时取消任务并移除 emitter。
- 前端读取流结束或网络错误时按 1s、2s、4s、8s、15s 退避重连；`AbortController.abort()` 后不再重连。
- 前端解析 SSE 时仅接受 JSON 业务事件，忽略 malformed 数据和 `connected` 握手内容；关闭编辑器时清理 channel、storage listener、reader、timer。
- 服务端不记录 token、完整 canvas 内容或私密评论；权限仍在每次订阅和发布请求中校验。

## 保存、分享、版本与导出

- 编辑后 900ms 防抖保存，30s 定时保存，`beforeunload` 使用 `keepalive` 保存未提交草稿；只读分享、保存冲突或未脏状态不发起保存。
- 分享 token 由服务端 `SecureRandom` 生成，服务端校验 `readonly`/`editable` 和过期/撤销状态；只读页面禁止所有编辑 mutation，但允许查看和导出。
- 团队版本保存完整 `canvasJson`，恢复前确认，恢复内容写入撤销栈并沿用 autosave。
- 导出只在浏览器 Canvas 完成，支持 PNG/JPEG、1-4 倍分辨率和 0.1-1 质量范围，先通过现有 usage quota。

## 错误处理

- 事件解析失败：忽略单条事件并继续监听，不影响当前编辑。
- SSE 断开：自动退避重连，仍可依赖已有 revision 轮询；不覆盖本地草稿。
- 保存 409：进入冲突状态，不重试覆盖服务器，显示重新加载/版本历史入口。
- 团队数据失败：显示协作区域错误，普通编辑和保存继续可用。
- 只读 mutation：显示权限提示，不调用服务端保存。
- 后端校验或权限失败：使用现有统一 `Result`/`BusinessException` 安全消息，不暴露堆栈。

## 测试与验收

### 单元/契约

- 事件白名单接受五种合法类型，拒绝未知类型和空类型。
- 协作桥接器在 BroadcastChannel 不可用时走 storage fallback；未知事件、错误 JSON 和自身事件不会通知订阅者。
- SSE reader 结束/错误时会退避重连；`close()` 后不会创建新连接且清理 timer。
- Broker 在 emitter 完成/超时/发送失败后移除订阅并停止心跳。

### 集成/回归

- 编辑器主流程：打开设计 -> 拖动图层 -> 发布文档事件 -> 自动保存 -> 生成分享链接 -> 只读链接禁止编辑 -> 导出 PNG/JPEG。
- 冲突流程：远端图层锁出现时本地拖拽被阻止；远端 revision 高于本地时出现更新提示；保存 409 后草稿不被覆盖。
- 版本流程：创建快照 -> 列出历史 -> 恢复快照 -> 自动保存。
- 运行仓库质量门禁、前端测试/构建、后端 Maven 测试和 changed-files code review。

## 兼容性、性能与回滚

支持 Chrome 和 Edge 的当前稳定版本。BroadcastChannel、SSE 和 `fetch keepalive` 均有浏览器降级路径；没有 SSE 时 revision 轮询仍提供最终一致性。事件仅对文档更新做 120ms 合并，光标最多每 40ms 发布一次，限制无界网络写入。回滚只需恢复本次修改的前后端文件，不涉及数据库回滚。

## 交付记录

本规格对应工单编号：`网站学院-All poster低代码开发平台项目-海报多人协作编辑任务工单`。实现完成后更新 `docs/superpowers/delivery-records/`，记录改动、风险、命令和实际测试结果。Git 暂存、提交和推送由人类在审查 diff 后执行。
