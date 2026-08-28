# AI Delivery Record: 质量门禁与 CI 流程

## Scope

- Request: 把提交规范、代码检测和上线前验证从文档要求落成可执行流程。
- In scope: 本地 PowerShell 质量门禁、前后端构建验证、GitHub Actions、PR 模板和高风险证据校验。
- Out of scope: 生产环境部署凭据、云厂商发布策略和自动合并权限配置。

## Design Decisions

- 本地与 CI 共用 `scripts/quality-gate.ps1`，避免两套命令产生漂移。
- 高风险校验只在 PR 事件强制要求完整证据，本地无 PR 元数据时只列出要求，不伪造审批。
- 保留现有 `scripts/codex-code-review.mjs`，质量门禁不删除或替换 Codex 审查入口。

## Verification

- `frontend`: 新增 `npm run test` 标准入口。
- 质量门禁脚本已覆盖 Codex 治理测试、Node、pnpm、Java 21、前端、admin-web 和后端测试。
- GitHub Actions 已配置 push/PR 触发、Node 22、pnpm 11.3、Java 21 和高风险证据检查。
- Tag 发布工作流已配置：复用质量门禁，打包前端、admin-web 和后端 JAR，并生成带 manifest 的 GitHub Release 制品。
- CI 质量门禁会显式传入 push parent 或 PR base；本地不传参数时仍审查当前工作区，避免 clean checkout 因 `diff HEAD` 为空而漏审本次提交。
- Conventional Commits 校验已接入 push/PR 工作流，提交标题不符合约定时直接失败。
- Pester 契约测试 9/9 通过；Codex 治理 Node 测试 14/14 通过；前端 lint、41 个 Node 测试、前端构建、admin-web 安装/构建和 Java 21 后端测试均通过。
- 完整 `pwsh -File scripts/quality-gate.ps1 -ReviewBaseRef HEAD~1` 已实际执行到依赖安装阶段；本机已有 Node 进程占用工作区 `node_modules`，导致 Windows `npm ci` 返回 `ENOTEMPTY`。CI 使用全新 runner，不受本地工作区锁影响。

## Residual Risk

- CI 只负责构建和证据门禁，生产部署仍需补充目标环境、密钥和回滚策略后再启用。
- 分支保护、必需检查和人工审批需要在 GitHub 仓库设置中开启，代码文件无法替代组织权限配置。
