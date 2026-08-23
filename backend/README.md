# 灵图工坊低代码设计平台 — 后端 Admin API

> 对标官网：[创客贴设计首页](https://www.chuangkit.com/designtools/designindex)

## 快速启动

### 环境要求

- JDK 21+
- Maven 3.9+（或 IntelliJ IDEA 直接打开 `backend` 目录运行）

### 启动命令

```bash
cd backend
mvn spring-boot:run
```

启动后访问：

| 地址 | 说明 |
|------|------|
| http://localhost:8080/admin/home/index | 首页聚合数据 |
| http://localhost:8080/admin/swagger-ui.html | API 文档 |
| http://localhost:8080/h2-console | H2 数据库控制台（dev 环境） |

### 演示账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| demo | 123456 | VIP 用户 |
| admin | 123456 | 团队版 |

生产环境请通过环境变量提供数据库和 JWT 配置：`MYSQL_USERNAME`、`MYSQL_PASSWORD`、`CHUANGKIT_JWT_SECRET`。

---

## 一、为什么要做后端？（Why）

灵图工坊不是「看看就行」的展示页，而是一个**真正的在线设计工具**：

1. **用户数据要持久化** — 登录状态、会员等级、最近设计、画布内容都必须存数据库，刷新页面不能丢。
2. **模板和素材是动态的** — 官网有 100 万+ 模板、热点日历、编辑推荐，这些数据来自服务端，不是写死在 HTML 里。
3. **编辑器需要读写画布** — 用户拖文字、换图片、调图层，最终存成 `canvasJson` 到后端，这和静态页面完全两码事。
4. **AI 工具要调接口** — 智能抠图、AI 海报、视频生成等，前端只负责展示，真正处理在后端（或后端转调 AI 服务）。
5. **前后端分离才能 100% 还原** — 官网每个 Tab、每个卡片、每次搜索都对应 API 请求；前端只负责渲染，数据全部来自 `/admin` 接口。

**结论：先做后端，是为了让前端「有数据可调」，避免做成假页面。**

---

## 二、这是什么？（What）

本项目是灵图工坊设计首页 + 核心能力的**后端复刻**，技术栈：

| 层级 | 技术 |
|------|------|
| 框架 | Spring Boot 3.2 + Java 21 |
| ORM | MyBatis-Plus |
| 数据库 | H2（开发）/ MySQL（生产） |
| 认证 | JWT + Spring Security |
| 文档 | SpringDoc OpenAPI |

### 核心业务模块（对应官网功能）

```
官网页面                     后端模块                    数据库表
─────────────────────────────────────────────────────────────────
首页搜索 Tab（设计模板/Agent）  →  search_tab              search_tab
热搜标签（七夕/小红书…）        →  hot_tag                 hot_tag
左侧导航（首页/模板/AI工具）    →  各 Controller           多表
创建设计 / 无限画布 / 图片编辑  →  design_scene            design_scene
热门推荐 Tab 功能卡片          →  home_feature            home_feature
模板瀑布流 / 搜索              →  design_template         design_template
热点日历                       →  calendar_event          calendar_event
编辑精选                       →  editor_collection       editor_collection
喜报 / 招聘专题                →  home_section            home_section
用户最近设计                   →  user_design             user_design
画布保存（编辑器核心）          →  DesignService           user_design.canvas_json
AI 工具（抠图/海报/视频）       →  ai_tool + ai_task       ai_tool, ai_task
素材库（图片/字体/贴纸）        →  material                material
登录 / 会员                    →  AuthService             sys_user
```

### API 统一前缀：`/admin`

所有接口以 `/admin` 开头，返回统一格式：

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

---

## 三、怎么实现的？（How）

### 3.1 整体架构

```
┌─────────────┐     HTTP/JSON      ┌──────────────────┐     SQL      ┌──────────┐
│  前端 Vue3   │ ◄──────────────► │  Spring Boot     │ ◄──────────► │  MySQL   │
│  (下一阶段)  │   /admin/**      │  Controller      │              │  / H2    │
└─────────────┘                  │  Service         │              └──────────┘
                                 │  Mapper          │
                                 └──────────────────┘
```

**数据流举例 — 用户点击模板开始设计：**

1. 前端 `POST /admin/designs` 传 `{ templateId: 7 }`
2. `DesignService` 从 `design_template` 表读出 `canvasJson`
3. 写入 `user_design` 表，返回设计 ID + 画布数据
4. 前端编辑器加载 `canvasJson` 渲染画布
5. 用户编辑后 `PUT /admin/designs/{id}` 自动保存

### 3.2 关键 API 清单

#### 认证 `/admin/auth`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /admin/auth/login | 登录，返回 JWT |
| POST | /admin/auth/register | 注册 |

#### 首页 `/admin/home`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /admin/home/index | **一次拿齐首页全部数据** |
| GET | /admin/home/hot-tags | 热搜标签 |
| GET | /admin/home/features?tabCode=hot | Tab 下功能卡片 |

#### 模板 `/admin/templates`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /admin/templates | 分页列表 |
| GET | /admin/templates/search?keyword=七夕 | 搜索 |
| GET | /admin/templates/{id} | 详情（含 canvasJson） |

#### 设计作品 `/admin/designs`（需登录）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /admin/designs | 最近设计 |
| POST | /admin/designs | 创建（基于模板/场景） |
| PUT | /admin/designs/{id} | 保存画布 |
| DELETE | /admin/designs/{id} | 删除 |

#### 其他

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /admin/scenes | 设计场景列表 |
| GET | /admin/categories | 模板分类 |
| GET | /admin/materials | 素材库 |
| GET | /admin/ai-tools | AI 工具列表 |
| POST | /admin/ai-tools/{code}/invoke | 调用 AI 工具 |
| GET | /admin/calendar/events | 热点日历 |
| GET | /admin/collections | 编辑精选 |
| GET | /admin/user/profile | 用户信息 |

### 3.3 画布数据格式（前后端协作核心）

```json
{
  "version": "1.0",
  "width": 1242,
  "height": 1660,
  "layers": [
    {
      "id": "layer-1",
      "type": "text",
      "content": "七夕快乐",
      "x": 100, "y": 200,
      "fontSize": 48,
      "color": "#FF0000"
    },
    {
      "id": "layer-2",
      "type": "image",
      "src": "https://...",
      "x": 0, "y": 0,
      "width": 1242, "height": 800
    }
  ]
}
```

前端编辑器负责渲染和交互，后端只存取 JSON 字符串 — 这是低代码平台的标准做法。

### 3.4 认证方式

登录后拿到 `token`，后续请求带 Header：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 3.5 生产环境切换 MySQL

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

修改 `application.yml` 中 prod 配置的数据库连接即可。

---

## 四、下一步：前端对接

前端（Vue 3 + Vite）按以下顺序对接：

1. **首页** — 调 `GET /admin/home/index` 渲染全部区块
2. **登录弹窗** — 调 `/admin/auth/login`，存 token
3. **模板列表/搜索** — 调 `/admin/templates` 和 `/admin/templates/search`
4. **设计编辑器** — 创建/保存调 `/admin/designs`，读写 `canvasJson`
5. **AI 工具页** — 调 `/admin/ai-tools` 和 invoke 接口

前端 API 基地址配置：

```javascript
// .env.development
VITE_API_BASE=http://localhost:8080/admin
```

---

## 五、项目结构

```
backend/
├── pom.xml
├── src/main/java/com/chuangkit/admin/
│   ├── ChuangkitAdminApplication.java    # 启动类
│   ├── common/                           # 统一响应、异常处理
│   ├── config/                           # Security、MyBatis 配置
│   ├── controller/                       # /admin 接口
│   ├── dto/                              # 请求/响应对象
│   ├── entity/                           # 数据库实体
│   ├── mapper/                           # MyBatis Mapper
│   ├── security/                         # JWT 认证
│   └── service/                          # 业务逻辑
└── src/main/resources/
    ├── application.yml
    └── db/
        ├── schema.sql                    # 建表
        └── data.sql                      # 演示数据
```
