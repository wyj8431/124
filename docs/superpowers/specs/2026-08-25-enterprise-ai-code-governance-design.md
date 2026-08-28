# Enterprise AI Code Governance Design

## Goal

建立一套与模型和 IDE 无关的企业级 AI 编码治理流程：AI 必须遵循统一的需求、设计、实现、测试和验证步骤；代码必须通过本地与 CI 质量门禁后才能合并。

## Scope

本设计覆盖当前仓库的 React/Vite 前端、Spring Boot/MyBatis-Plus 后端、Codex/Claude Code 兼容规则、PowerShell 本地门禁和 GitHub Actions 门禁。

不承诺也不伪造“某个插件一定被调用”的证明。插件调用发生在代理运行时，Git 无法可靠验证；治理目标改为强制可审计产物和可重复的代码质量结果。`superpowers` 作为推荐工作流，`CLAUDE.md` 作为 Claude Code 兼容入口；本机未发现 `claude-code-everything`，因此不依赖其不可用的专有能力。

## Design Principles

1. 结果优先于工具：测试、构建、安全和审查结果必须可复现。
2. 本地与 CI 同源：本地脚本和 CI 调用同一套质量命令，减少“本地通过、CI 失败”。
3. 高风险变更加严：鉴权、权限、数据库、支付、上传、部署配置必须有回归测试和人工复核。
4. 失败可定位：每个阶段报告明确的命令、失败原因和修复方向。
5. 最小变更：AI 需要说明改动边界、未处理内容和剩余风险，不得借机进行无关重构。

## Repository Contracts

### `AGENTS.md`

作为通用代理和 Codex 的仓库级入口，规定：

- 开始工作前读取适用技能；涉及创意/行为变化先完成设计和用户确认。
- 多步骤任务必须留下设计文档和实现计划。
- 实现遵循测试先行、最小变更、验证后再宣称完成。
- 不得绕过测试、隐藏失败、提交密钥或修改无关文件。

### `CLAUDE.md`

作为 Claude Code 兼容入口，复述同一套不可变规则，并要求代理使用 `superpowers` 工作流：

`brainstorming -> writing-plans -> test-driven-development -> implementation -> verification-before-completion`。

它不声称 `claude-code-everything` 已安装；如果该插件未来安装，插件规则必须服从用户指令和本文件的结果门禁。

### `docs/engineering/ai-code-standard.md`

保存面向人和 AI 的完整标准，包括需求澄清、架构边界、接口/数据兼容、安全、测试、可观测性、提交和审查清单。

### AI 交付记录

每次非 trivial 变更的交付说明必须包含：

- 需求和不做什么
- 设计决策与替代方案
- 修改文件和风险边界
- 测试/构建命令及真实结果
- 未验证事项和后续风险

## Quality Gate

### Required checks

`scripts/quality-gate.ps1` 提供唯一的本地入口，按顺序执行：

1. `git diff --check`
2. `node scripts/codex-code-review.mjs --scope changed-files --format json`
3. Node、pnpm 和 Java 21 运行时预检
4. 前端 `npm ci --ignore-scripts`
5. 前端 `npm run lint`
6. 前端 `npm run test`
7. 前端 `npm run build`
8. admin-web `pnpm install --frozen-lockfile`
9. admin-web `pnpm run build`
10. 后端 `mvnw.cmd -q test`，使用 Java 21

脚本失败时返回非零退出码，输出阶段名称和原始命令；脚本不自动修复代码、不清理用户文件、不修改数据库源文件。

### CI

`.github/workflows/quality-gate.yml` 在 Push 和 Pull Request 上调用同一套检查，使用 Node 22、pnpm 11.3 和 Java 21，缓存依赖但不缓存测试结果。PR 必须通过全部 job 才能合并；Codex review 返回 high 级问题时门禁失败。

### High-risk policy

以下路径触发高风险检查：

- `backend/**/security/**`
- `backend/**/config/**`
- `backend/**/controller/**`
- `backend/**/service/**` 中鉴权、权限、支付、上传相关代码
- `backend/src/main/resources/db/**`
- `frontend/src/api/**`、认证上下文、路由守卫
- `.github/**`、部署和环境配置

高风险变更必须在交付记录中说明威胁面、数据迁移/兼容性和回滚方式，并至少包含一个针对变更行为的回归测试。CI 负责提醒和检查证据格式，人工复核负责最终批准。

## Test Strategy

- 前端：TypeScript 编译、oxlint、Node 静态/行为回归测试、Vite 生产构建。
- 后端：Maven 单元/集成测试；涉及数据库、鉴权或事务的变更必须覆盖成功、拒绝和边界路径。
- 跨端流程：对登录、设计保存、协作评论/通知等主流程保留 API 或浏览器烟测。
- 完成声明前必须运行与改动风险匹配的全量门禁，并记录结果；不能以“代码看起来正确”代替验证。

## Failure and Exception Handling

- 缺少 Node、Java 21 或依赖安装失败：门禁失败并给出环境修复命令，不降级跳过。
- 单个测试失败：保留失败输出，禁止只运行通过的测试来替代全量结果。
- 外部服务不可用：允许使用明确标记的本地 mock 进行单元测试，但必须把未完成的真实集成验证列为风险。
- 生成物、日志、临时数据库和密钥文件不得进入提交；发现疑似密钥时停止并人工确认。

## Non-goals

- 不把模型名称、插件名称或提示词当作安全证明。
- 不在本次治理改造中重构现有业务模块。
- 不强行引入当前仓库没有维护能力的重量级扫描平台。

## Acceptance Criteria

1. 新代理能从 `AGENTS.md`/`CLAUDE.md` 获得一致工作流。
2. 开发者可用一条 PowerShell 命令运行全部质量门禁。
3. PR 自动运行与本地同源的前后端检查。
4. 质量失败返回非零状态，不能被“完成”声明掩盖。
5. 高风险变更有明确的人工复核证据。
6. 规范、计划、测试输出和提交记录可被审计。
