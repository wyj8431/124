# AI Delivery Record: 外部模板编辑器初始画布

## Scope

- Request: 首页点击官方图片模板后进入设计页时显示被点击的模板。
- In scope: 本地不存在的官方模板创建副本时的初始 `canvasJson`、后端回归测试、运行中的服务重启和接口验证。
- Out of scope: 登录鉴权、首页跳转路由、本地模板画布结构、官方模板内部文字和元素拆分。

## Root Cause

首页官方模板 ID（例如 `583965`）可能不在本地 `design_template` 表。后端此前只保存了封面 URL，并为这类设计写入 `layers: []`，所以编辑器正确加载了一个空白画布。

## Changed Behavior

- `DesignService.create` 对本地不存在但带有模板标题的官方模板，使用请求中的正数宽高（缺失时 `800x600`）。
- 有封面 URL 时，保存一张 `type=image` 的全尺寸图层：位置 `(0, 0)`、宽高等于画布、`src` 等于封面 URL。
- 封面为空时保持空画布，避免写入无效的 `null` JSON。
- 图片图层复用现有编辑器能力，可继续移动、缩放、删除和保存。

## Verification

- RED: 修复前运行 `backend\\mvnw.cmd -q -Dtest=DesignServiceTest test`，外部模板测试在 `layers` 断言处失败。
- GREEN: 运行 `backend\\mvnw.cmd -q -Dmaven.compiler.useIncrementalCompilation=false test`，后端完整 Maven 测试通过。
- Frontend: `npm run test` 通过，56/56；`npm run lint` 退出码 0（仅已有 warning）；`npm run build` 退出码 0（仅已有 Vite 配置和 chunk 大小 warning）。
- 定向 Codex review：`node scripts/codex-code-review.mjs --scope changed-files --paths backend/src/main/java/com/chuangkit/admin/service/DesignService.java,backend/src/test/java/com/chuangkit/admin/service/DesignServiceTest.java --format json --severity medium`，0 findings。
- 真实接口：演示账号登录后创建官方模板 `583965`，返回 `layers` 数量 1，图层类型 `image`，尺寸 `1242x1660`，来源为请求封面 URL；验证设计已删除。
- 服务已重启并监听：前端 `http://127.0.0.1:5173`，管理端 `http://127.0.0.1:5174`，后端 `http://127.0.0.1:8081`。

## Quality Gate Note

已运行 `pwsh -File scripts/quality-gate.ps1`。门禁在全量 changed-files review 阶段停止，报告两条与本次无关的中等级依赖扫描结果，均指向 `frontend/public/models/selfie-segmentation/*wasm_bin.js` 生成文件；这些文件属于工作区既有 MediaPipe 资源，本次未修改、删除或绕过。其余门禁阶段因脚本按失败即停止而未执行。

## Residual Risk

- 官方目录目前只有封面资源，没有完整的可编辑画布 JSON，因此创建的是一张扁平封面图，不会自动拆分官方模板的文字和元素。
- 外部 CDN 封面 URL 可能过期；本次不下载、代理或刷新官方资源。
