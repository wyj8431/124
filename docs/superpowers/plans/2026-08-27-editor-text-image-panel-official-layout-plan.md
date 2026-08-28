# 编辑器文字与图片官网式面板 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让编辑器文字和图片侧栏具备官网截图中的快捷入口、搜索、标签和分组预览结构。

**Architecture:** 在既有文字资源组件上增加快捷文字及 AI 入口，新建图片资源面板承载上传后的本地目录搜索、标签和分组展示。页面继续过滤本地公开目录，并把选择动作交给已有的文字、图片及上传函数。

**Tech Stack:** React 19、TypeScript、Lucide、Vite、现有本地公开目录模块。

**Spec:** `docs/superpowers/specs/2026-08-27-editor-text-image-panel-official-layout-design.md`

## Global Constraints

- 只使用 `/create-design/official/catalog.json` 与本地预览图；禁止增加官网运行时请求。
- 保留 `addTextLayer`、`addOfficialResource`、`addImageLayer`、`uploadImage` 的现有数据和权限路径。
- 不触碰与文字、图片面板无关的工作区改动。

---

### Task 1: 锁定两个面板的回归契约

**Files:**
- Modify: `frontend/test/editor-official-catalog.test.mjs`

- [ ] **Step 1: 写入失败的文字面板断言**

断言 `TextResourcePanel` 接受 `onAddText` 与 `onOpenAiWriter`，渲染“标题”“副标题”“正文”“竖排文字”“特效文字”及“AI 文案”，并仍保留搜索、空态和每组三张缩略图。

- [ ] **Step 2: 写入失败的图片面板断言**

读取新 `ImageResourcePanel.tsx` 与编辑器页面，断言有“搜索图片”、标签按钮、两列展开网格、空态、上传/URL 回调和 `sceneId !== 459` 的图片资源筛选。

- [ ] **Step 3: 运行聚焦测试并确认失败**

Run: `node --test test/editor-official-catalog.test.mjs`

Expected: FAIL，因为现有文字面板没有快捷创作入口，图片面板组件尚不存在。

### Task 2: 实现文字快捷创作与图片分组浏览

**Files:**
- Modify: `frontend/src/components/editor/TextResourcePanel.tsx`
- Create: `frontend/src/components/editor/ImageResourcePanel.tsx`
- Modify: `frontend/src/index.css`

- [ ] **Step 1: 扩展文字面板受控回调**

为组件添加 `onAddText(preset)` 与 `onOpenAiWriter()`，在搜索框下方渲染五个快捷动作和可点击的 AI 文案横幅。快捷动作直接将预设传给页面，不在组件中持久化画布数据。

- [ ] **Step 2: 新建图片面板**

定义 `ImageResourceGroup { id, title, tag, resources }`。组件拥有查询、选择标签、展开组状态；接收受控的 URL 值、上传回调、URL 提交回调和资源选择回调。默认三张图片横向预览，展开后使用两列稳定网格。

- [ ] **Step 3: 增加专属样式**

在现有编辑器资源样式附近添加文字快捷网格、AI 横幅、图片搜索、标签、横向图片条和图片展开网格。保持白色工具面板、浅灰控件和现有蓝色焦点，不覆盖通用 `OfficialResourcePanel`。

- [ ] **Step 4: 运行聚焦测试并确认通过**

Run: `node --test test/editor-official-catalog.test.mjs`

Expected: PASS。

### Task 3: 页面分组与画布接入

**Files:**
- Modify: `frontend/src/pages/DesignEditorPage.tsx`
- Modify: `frontend/test/editor-official-catalog.test.mjs`

- [ ] **Step 1: 建立文字和图片分组**

文字分组仅筛选艺术字场景 `459`；图片分组仅筛选非 `459` 的 asset 资源和本地 background 资源，用稳定关键词顺序去重，未匹配的图片加入“插画精选”。

- [ ] **Step 2: 接入文字面板**

将 `addTextLayer` 作为快捷文字回调传入；AI 横幅通过 `setActiveTool('ai')` 打开现有 AI 工具。保留艺术字选择调用 `addOfficialResource`。

- [ ] **Step 3: 接入图片面板**

将文件选择、URL 状态、URL 添加和 `addOfficialResource` 传入新组件。图片分组内背景资源仍作为普通图片层插入；背景工具独有的最底层插入函数保持不变。

- [ ] **Step 4: 运行聚焦测试并确认通过**

Run: `node --test test/editor-official-catalog.test.mjs`

Expected: PASS。

### Task 4: 视觉回归与交付

**Files:**
- Modify: `docs/superpowers/delivery-records/2026-08-27-editor-text-panel-official-layout.md`

- [ ] **Step 1: 浏览器验收**

验证文字快捷文字会创建文字图层、AI 横幅切换到 AI 工具、文字分组展开与搜索空态；验证图片上传入口、URL 输入、标签筛选、图片分组选择与 900px 响应式轨道。

- [ ] **Step 2: 运行仓库检查**

Run:

```bash
node scripts/codex-code-review.mjs --scope changed-files --format json
pwsh -File scripts/quality-gate.ps1
```

Expected: 无 high/medium finding，质量门禁以 `QUALITY GATE PASSED` 结束。

- [ ] **Step 3: 记录实际证据和残余风险**

更新交付记录，写明官网浏览器会话不可复用、以用户截图和本地目录作为视觉/数据真相；分类仍依赖本地快照的标题关键词。
