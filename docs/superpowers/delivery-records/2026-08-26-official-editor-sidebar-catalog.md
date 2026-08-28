# AI Delivery Record: 编辑器官网公开目录侧栏

## Scope

- Request: 丰富设计编辑器左侧工具栏，并以创客贴公开目录的浏览体验为参考。
- In scope: 保留垂直工具轨，新增品牌入口；在素材和模板面板中浏览、分类和搜索本地官网公开目录；将场景尺寸或本地模板封面应用到现有画布。
- Out of scope: 运行时爬取官网、登录态数据、购买与授权、远端收藏、后端或数据库改动，以及把模板封面拆解为可编辑图层。

## Local-Only Boundary

- 编辑器只请求 `/create-design/official/catalog.json`，并仅接受 `/create-design/official/scenes/` 和 `/create-design/official/templates/` 下的本地路径。
- `sync:editor-catalog` 是开发者显式执行的同步命令；运行时不会请求、解析或执行 `chuangkit.com` 页面或脚本。
- 目录读取失败时，原有内置素材和画布编辑流程保持可用。

## Delivered Changes

- 新增目录加载器及类型声明，校验分类、场景、模板和本地资源路径，并在内存中完成筛选。
- 新增无状态的公开目录面板，提供可访问的分类按钮、场景尺寸卡片、懒加载模板封面、缺图占位和空状态。
- 编辑器的素材和模板入口复用目录面板；场景更新画布尺寸，模板封面作为普通图片图层加入画布；新增品牌色快捷项和无资源状态。
- 目录卡片采用紧凑三列样式。小于 900px 时隐藏扩展面板，仅保留 64px 工具轨；小于 680px 时收敛顶部和底部操作，避免控件越出视口。

## Files

- `frontend/src/modules/editor/officialCatalog.mjs`
- `frontend/src/modules/editor/officialCatalog.d.mts`
- `frontend/src/components/editor/OfficialCatalogPanel.tsx`
- `frontend/src/pages/DesignEditorPage.tsx`
- `frontend/src/index.css`
- `frontend/package.json`
- `frontend/test/editor-official-catalog.test.mjs`

## Verification Evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Focused catalog regression | PASS | `node --test test/editor-official-catalog.test.mjs`: 6 passed, 0 failed. |
| Desktop browser smoke test | PASS | `http://127.0.0.1:5173/editor/819?preview=1`: the 素材 rail opens the public catalog; category cards and local scene/template media render. |
| Local network boundary | PASS | `/create-design/official/catalog.json` and visible `/create-design/official/...` assets returned 200; `chuangkit.com` request filter returned no entries. |
| Narrow viewport | PASS | At `390 x 844`, tool panel and inspector were `display: none`, tool rail was `64px`, workspace was `326px`, `scrollWidth` equaled `390px`, and no visible header/bottom control exceeded the viewport. |
| Frontend lint | PASS | `npm run lint` exited 0; only 10 pre-existing Fast Refresh and hook-dependency warnings remain. |
| Full frontend tests | PASS | `npm test`: 62 passed, 0 failed. |
| Frontend build | PASS | `npm run build` completed TypeScript checking and Vite production build. |
| Changed-file review | PASS | `node scripts/codex-code-review.mjs --scope changed-files --format json`: 0 findings. |
| Repository quality gate | PASS | `pwsh -File scripts/quality-gate.ps1` exited 0 and ended with `QUALITY GATE PASSED`; governance, frontend, admin-web, and backend checks completed. |

## Residual Risk

- 本地目录是版本快照，更新需要显式运行同步脚本并审核变化。
- 模板封面是扁平图片图层，不能编辑其原始文字和图形。
- 目录中历史缺失的本地资源会显示文字占位，不会向远端补图。
