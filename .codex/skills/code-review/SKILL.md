---
name: code-review
description: "在 Codex 中自动审查每次代码变更，按统一规则输出带文件定位和风险级别的结构化报告。"
---

# Codex 代码审查 Skill

本 Skill 是本项目在 Codex 中的代码审查入口。底层规则和报告契约复用 `cursor-skills/code-review/SKILL.md`，但不依赖 Cursor 或 Trae。

## 自动触发契约

只要当前任务修改、创建或删除代码文件，Codex 必须在准备报告“已完成”之前运行一次变更集审查。该 Skill 通过 `agents/openai.yaml` 的隐式调用策略加载，并由项目根目录 `AGENTS.md` 作为交付前约束。

不得用“只改了一行”“已经手动看过”“测试通过”跳过审查。审查发现 high 或 medium 问题时，先修复并重新运行审查；无法修复时必须在最终结果中明确列出文件、行号和阻塞原因。

## Codex 命令

在项目根目录运行：

```powershell
node scripts/codex-code-review.mjs --scope changed-files --format json
```

需要聚焦范围时：

```powershell
node scripts/codex-code-review.mjs --scope component-standards --format markdown --paths frontend/src
node scripts/codex-code-review.mjs --scope performance-issues --format json --severity medium
```

脚本退出码：`0` 表示没有 high 级问题，`2` 表示存在 high 级问题，`1` 表示输入或执行错误。Codex 必须阅读 JSON/Markdown 报告，而不是只检查退出码。

## 审查步骤

1. 确认范围为当前 Git 变更集；用户指定路径时不得扩大范围。
2. 阅读报告中的每条 actionable finding，并结合被引用文件上下文判断。
3. 修复 high/medium 问题，或在交付说明中记录明确阻塞。
4. 重新运行同一命令，确认报告与最终代码一致。
5. 在最终回复中列出审查命令、结果和未解决风险。

## 自动触发接线

编辑器保存代码后由 `.cursor/hooks.json` 或 `.trae/hooks.json` 调用 `scripts/codex-code-review-hook.mjs`；该 runner 会跳过非代码文件并复用统一 CLI。Git 兜底通过 `frontend` 下的 `npm run hooks:install` 启用 `.githooks/pre-commit`，提交前阻断 high/medium 发现。
