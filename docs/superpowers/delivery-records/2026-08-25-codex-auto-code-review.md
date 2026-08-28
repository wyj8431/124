# Codex 自动代码审查交付记录

## 目标

在不依赖 Cursor 或 Trae 的前提下，让 Codex 在每次代码变更准备交付前自动运行项目代码审查，并要求处理高风险发现。

## 实际改动

- `.codex/skills/code-review/SKILL.md`：改为 Codex 原生 Skill，定义隐式触发、审查命令、修复重跑和最终报告契约。
- `.codex/skills/code-review/agents/openai.yaml`：启用 `allow_implicit_invocation: true`，默认提示改为完成前审查。
- `scripts/codex-code-review.mjs`：提供 Codex 的统一 Node 入口，复用现有审查引擎和退出码。
- `AGENTS.md`、`CLAUDE.md`：加入代码交付前必须运行审查的项目级约束。
- `README.md`、`cursor-skills/code-review/README.md`：将 Codex 作为正式入口，保留共享规则引擎兼容路径。
- `cursor-skills/code-review/test/codex-integration.test.mjs`：验证 Skill、隐式策略、项目约束和统一入口的接线。

## 验证

- `node --test cursor-skills/code-review/test/codex-integration.test.mjs cursor-skills/code-review/test/review-engine.test.mjs`：通过，5 个测试。
- `node scripts/codex-code-review.mjs --help`：通过，帮助信息正常输出。
- 针对本次接线文件运行 `node scripts/codex-code-review.mjs --scope changed-files --format json --paths ...`：通过，0 条 findings。
- `git diff --check`：通过，无空白错误。

## 约束与风险

- Codex 的 Skill 隐式调用和 `AGENTS.md` 约束共同实现“完成前自动审查”；仓库本身没有可拦截 Codex 最终回复的 post-turn API，因此无法用纯 Git hook 强制拦截每次模型回复。
- 全仓审查会报告已有测试夹具 `cursor-skills/code-review/test/review-engine.test.mjs:16` 中故意使用的 `./missing-module`，这是测试规则本身的 fixture，不是本次接线引入的问题。实际任务应优先使用当前变更路径或确认该 finding 是否为基线。
- 项目要求的 `scripts/quality-gate.ps1` 当前不存在，未在本次接线中新增无关质量门禁脚本。
