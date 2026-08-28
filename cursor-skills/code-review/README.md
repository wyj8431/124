# Code Review Skill

这是 All poster 低代码开发平台的共享代码审查规则和报告契约。Codex 的正式入口是 `.codex/skills/code-review` 与 `scripts/codex-code-review.mjs`；`cursor-skills` 目录仅保留规则引擎的兼容路径。

## 使用

在 Codex 中，代码变更完成前会隐式调用项目 Skill。也可以在项目根目录执行：

```powershell
node scripts/codex-code-review.mjs --scope changed-files --format json
node scripts/codex-code-review.mjs --scope component-standards --format markdown --paths frontend/src
node scripts/codex-code-review.mjs --scope performance-issues --format json --severity medium
```

底层适配器也可以直接执行：

```powershell
node cursor-skills/code-review/scripts/review-changed-files.mjs --scope changed-files --format markdown
node cursor-skills/code-review/scripts/review-changed-files.mjs --scope changed-files --format json --severity medium
node cursor-skills/code-review/scripts/review-changed-files.mjs --scope changed-files --rules cursor-skills/code-review/rules.json
```

高风险问题会使适配器以退出码 `2` 结束，便于在 CI 中阻断合并；没有高风险问题时退出码为 `0`。

## 目录

- `SKILL.md`：技能元数据、触发语义、审查协议和输出契约。
- `rules.json`：可调节的规则清单和默认阈值。
- `scripts/review-engine.mjs`：跨文件解析和规则执行核心。
- `scripts/review-changed-files.mjs`：Git 变更集命令适配器。
- `../../scripts/codex-code-review-hook.mjs`：编辑器 after-file-edit 和 Git pre-commit 共用的自动触发 runner。
- `../../scripts/codex-code-review.mjs`：Codex 的统一命令入口。
- `examples/review-panel.html`：无依赖的集成面板示例。
- `examples/review-report.schema.json`：结构化结果契约。
- `../../frontend/src/pages/CodeReviewPage.tsx`：项目内 React 示例页，路由为 `/tools/code-review`。

## 参数化

可以通过 `--paths` 限制目录，通过 `--severity` 过滤最低风险等级，通过 `--max` 限制返回条数，通过 `--rules` 指定规则文件。规则本身的启停和默认级别在 `rules.json` 中维护；修改后需要运行 Skill 测试和前端构建。
