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
- [x] 功能 Tab 切换加载不同卡片
- [x] 设计编辑器 MVP（图层编辑、撤销重做、自动保存、PNG 导出）
- [ ] AI 工具页面
- [ ] 模板详情页

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19, Vite, Tailwind CSS, TanStack Query |
| 后端 | Java 21, Spring Boot 3, MyBatis-Plus, H2/MySQL |
| 认证 | JWT |

详细文档见 [backend/README.md](./backend/README.md) 和 [frontend/README.md](./frontend/README.md)。

## 开发 Skills

开发进度、每日开发日报模板和可复用提示词见 [DEVELOPMENT_SKILLS.md](./DEVELOPMENT_SKILLS.md)。
