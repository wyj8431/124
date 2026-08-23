# 灵图工坊低代码设计平台 — 前端

React 19 + Vite + Tailwind CSS，100% 对标 [创客贴官网](https://www.chuangkit.com/designtools/designindex)，数据来自 Java 后端 `/admin` 接口。

## 启动

```bash
# 1. 启动后端（另开终端）
cd backend
set JAVA_HOME=C:\Program Files\Java\jdk-21.0.12
mvnw.cmd spring-boot:run

# 2. 启动前端
cd frontend
npm install
npm run dev
```

浏览器打开 http://localhost:5173

## 技术栈

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- TanStack Query（数据请求）
- Axios（API 调用）
- Lucide React（图标）

## 真实数据对接

| 页面区块 | API |
|---------|-----|
| 首页全部数据 | `GET /admin/home/index` |
| 功能 Tab 切换 | `GET /admin/home/features?tabCode=` |
| 模板搜索 | `GET /admin/templates/search?keyword=` |
| 分类模板 | `GET /admin/templates?categoryId=` |
| 登录/注册 | `POST /admin/auth/login` |
| 创建设计 | `POST /admin/designs` |

演示账号：`demo` / `123456`

## 目录结构

```
src/
├── api/           # Axios 封装
├── components/
│   ├── auth/      # 登录弹窗
│   ├── home/      # 首页各区块
│   └── layout/    # 侧边栏、顶栏、底部横幅
├── context/       # Auth 状态
├── pages/         # 页面
├── types/         # TypeScript 类型
└── utils/         # 工具函数
```
