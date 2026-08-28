# Codex 自动审查 Hook 交付记录

## 目标

让代码编辑完成后有可执行的自动审查触发器，不再只依赖 Skill 的隐式提示或页面上的手动按钮。

## 实际改动

- `scripts/codex-code-review-hook.mjs`：读取编辑器事件 JSON，过滤非代码文件，复用统一审查 CLI；支持提交基线和风险阻断阈值。
- `.cursor/hooks.json`、`.trae/hooks.json`：接入 `afterFileEdit`。
- `.githooks/pre-commit`、`.githooks/post-commit`、`scripts/install-code-review-hooks.mjs`：增加提交前阻断和提交后复核，并提供一次性安装命令。
- `scripts/codex-code-review.mjs`：改为可安全 import 的 CLI/模块双入口。
- `frontend/src/pages/CodeReviewPage.tsx`、`frontend/src/index.css`：展示自动触发状态并改用 Codex 统一命令。
- `cursor-skills/code-review/test/automatic-hook.test.mjs`：覆盖事件路径提取、非代码跳过、风险参数和配置接线。

## 验证

- `node --test cursor-skills/code-review/test/automatic-hook.test.mjs`：通过，4 个测试。
- `node scripts/codex-code-review-hook.mjs --dry-run`：输出待审查参数。
- `README.md`、工程标准和 Codex Skill 已记录安装与触发边界。

## 风险与边界

- 编辑器 Hook 是否执行取决于 Cursor/Trae 是否启用项目 Hook；Git 兜底需要每个 clone 执行一次 `frontend/npm run hooks:install`。
- Codex 当前没有仓库级 post-turn API，因此不能从 Git 外部强制拦截模型最终回复；项目内可执行保障是 after-file-edit 与 pre-commit。
