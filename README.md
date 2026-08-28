# 灵图工坊低代码设计平台

100% 还原 [创客贴官网](https://www.chuangkit.com/designtools/designindex) 的在线设计平台，前后端真实数据互联。

## 项目结构

```
灵图工坊/
├── backend/     # Java Spring Boot 后端（/admin API）
└── frontend/    # React 19 + Vite + Tailwind 前端
```

## 快速启动

### 1. 后端

```bash
cd backend
# Windows 需设置 JAVA_HOME
set JAVA_HOME=C:\Program Files\Java\jdk-21.0.12
mvnw.cmd spring-boot:run
```

后端地址：http://localhost:8081  
API 文档：http://localhost:8081/admin/swagger-ui.html

### 2. 前端

```bash
cd frontend
npm install
npm run dev
```

前端地址：http://localhost:5173（自动代理 `/admin` 到后端）

### 演示账号

- 用户名：`demo`
- 密码：`123456`

## 功能清单

- [x] 首页 UI 对标官网（侧边栏、搜索、模板瀑布流、热点日历等）
- [x] 后端 API 真实数据驱动（非静态假数据）
- [x] 登录/注册（JWT）
- [x] 模板搜索
- [x] 基于模板创建设计
- [x] 设计编辑器 MVP（图层编辑、撤销重做、自动保存、PNG 导出）
- [x] 免费用户每日创建/保存/导出额度，会员额度豁免
- [x] 功能 Tab 切换加载不同卡片
- [x] AI 生成任务链路（登录鉴权、异步任务、状态轮询、真实 Provider 输出与失败提示）
- [x] 模板详情页（预览、收藏、使用模板进入编辑器）

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19, Vite, Tailwind CSS, TanStack Query |
| 后端 | Java 21, Spring Boot 3, MyBatis-Plus, H2/MySQL |
| 认证 | JWT |

详细文档见 [backend/README.md](./backend/README.md) 和 [frontend/README.md](./frontend/README.md)。

## MySQL MCP

项目包含独立的只读优先 MySQL MCP 服务，可让支持 MCP 的 AI 客户端通过授权数据库账号查询或在显式开启后执行写操作。服务位于 [mcp/mysql-server](./mcp/mysql-server)，配置、最小权限授权 SQL 和客户端接入示例见 [mcp/mysql-server/README.md](./mcp/mysql-server/README.md)。

## 开发 Skills

开发进度、每日开发日报模板和可复用提示词见 [DEVELOPMENT_SKILLS.md](./DEVELOPMENT_SKILLS.md)。项目内的日报 Skill 位于 `.codex/skills/daily-report-summary`。

代码审查规则见 [cursor-skills/code-review/SKILL.md](./cursor-skills/code-review/SKILL.md)，Codex 会在代码变更完成前隐式调用项目 Skill。也可在项目根目录手动运行 `node scripts/codex-code-review.mjs --scope changed-files --format json`；项目内示例页为 `/tools/code-review`。

代码编辑后的自动审查由编辑器 Hook 和 Git Hook 共同保障：`.cursor/hooks.json` 与 `.trae/hooks.json` 在 `afterFileEdit` 时调用 `scripts/codex-code-review-hook.mjs`，非代码文件会跳过；首次使用 Git 兜底时在 `frontend` 目录运行 `npm run hooks:install`，它会启用 `.githooks/pre-commit`（high/medium 问题阻断提交）、`.githooks/pre-push`（推送前运行完整质量门禁）和 `.githooks/post-commit`（提交后复核）。`pre-push` 默认以 `origin/main` 为审查基线，也可通过 `GATE_REVIEW_BASE` 指定其他基线。

使用方式：在项目根目录打开 Codex，输入 `使用 $daily-report-summary 总结今天的开发日报`。Skill 会读取当天 Git 证据和已验证记录；如需指定日期，可先运行 `& .codex\skills\daily-report-summary\scripts\collect_daily_evidence.ps1 -ProjectRoot . -Date '2026-08-25'`，再调用 Skill。
