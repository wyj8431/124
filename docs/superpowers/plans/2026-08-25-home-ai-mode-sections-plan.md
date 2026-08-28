# 首页 AI 模式五栏内容 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure Agent、图片生成和视频生成模式各自显示五个官网灵感栏目，并保持已确认的优先顺序。

**Architecture:** 将模式到栏目组的顺序公开为数据契约，再从契约生成 `HomePage` 已消费的模式栏目数组。一个 Node 测试在运行时转译纯 TypeScript 数据文件，验证真实的三种排序和现有页面接线。

**Tech Stack:** React 19、TypeScript 6、Vite 8、Node built-in test runner、TypeScript transpiler API。

---

## File Map

- Modify: `frontend/src/data/chuangkitHomeAiModesOfficial.ts` - 发布并使用栏目组排序契约。
- Create: `frontend/test/home-ai-mode-sections.test.mjs` - 覆盖运行时数据与首页模式接线。
- Create: `docs/superpowers/delivery-records/2026-08-25-home-ai-mode-sections.md` - 记录范围、风险和验证证据。

### Task 1: Add a failing contract test

**Files:**

- Create: `frontend/test/home-ai-mode-sections.test.mjs`
- Verify: `frontend/src/data/chuangkitHomeAiModesOfficial.ts`
- Verify: `frontend/src/pages/HomePage.tsx`

- [x] **Step 1: Write the failing test**

```js
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const dataModuleUrl = new URL('../src/data/chuangkitHomeAiModesOfficial.ts', import.meta.url)
const homePageUrl = new URL('../src/pages/HomePage.tsx', import.meta.url)

async function loadAiModeData() {
  const source = await readFile(dataModuleUrl, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const module = { exports: {} }
  new Function('exports', 'module', output)(module.exports, module)
  return module.exports
}

test('AI mode sections expose every approved five-section order', async () => {
  const { OFFICIAL_HOME_AI_MODE_SECTION_CODES, OFFICIAL_HOME_AI_MODE_SECTIONS } = await loadAiModeData()
  assert.deepEqual(OFFICIAL_HOME_AI_MODE_SECTION_CODES, {
    agent: ['agent', 'image_gen', 'video_gen'],
    image_gen: ['image_gen', 'agent', 'video_gen'],
    video_gen: ['video_gen', 'agent', 'image_gen'],
  })
  assert.deepEqual(
    Object.fromEntries(Object.entries(OFFICIAL_HOME_AI_MODE_SECTIONS).map(([mode, sections]) => [
      mode,
      sections.map((section) => section.code),
    ])),
    {
      agent: ['official-xiaohongshu', 'official-marketing', 'official-amazon', 'official-product-detail', 'official-short-drama'],
      image_gen: ['official-amazon', 'official-product-detail', 'official-xiaohongshu', 'official-marketing', 'official-short-drama'],
      video_gen: ['official-short-drama', 'official-xiaohongshu', 'official-marketing', 'official-amazon', 'official-product-detail'],
    },
  )
})

test('homepage reads the selected AI mode and renders supplied sections', async () => {
  const source = await readFile(homePageUrl, 'utf8')
  assert.match(source, /onModeChange=\{handleHomeModeChange\}/)
  assert.match(source, /OFFICIAL_HOME_AI_MODE_SECTIONS\[activeHomeMode as OfficialHomeAiMode\]/)
  assert.match(source, /isAiHomeMode \? \([\s\S]*officialAiModeSections\.map\(/)
  assert.match(source, /section=\{section\}/)
})
```

- [x] **Step 2: Verify red**

```powershell
Push-Location frontend
node --test test/home-ai-mode-sections.test.mjs
Pop-Location
```

Expected: first test fails because `OFFICIAL_HOME_AI_MODE_SECTION_CODES` is not exported; the homepage-wiring test passes.

### Task 2: Derive the existing section lists from the approved order

**Files:**

- Modify: `frontend/src/data/chuangkitHomeAiModesOfficial.ts`
- Test: `frontend/test/home-ai-mode-sections.test.mjs`

- [x] **Step 1: Add the contract and resolver**

After `OfficialHomeAiMode`, add:

```ts
export type OfficialHomeAiSectionGroup = OfficialHomeAiMode
```

Replace the existing final section-list declarations with:

```ts
const OFFICIAL_HOME_AI_SECTION_GROUPS: Record<OfficialHomeAiSectionGroup, HomeSection[]> = {
  agent: AGENT_SECTIONS,
  image_gen: IMAGE_SECTIONS,
  video_gen: VIDEO_SECTIONS,
}

export const OFFICIAL_HOME_AI_MODE_SECTION_CODES: Record<OfficialHomeAiMode, OfficialHomeAiSectionGroup[]> = {
  agent: ['agent', 'image_gen', 'video_gen'],
  image_gen: ['image_gen', 'agent', 'video_gen'],
  video_gen: ['video_gen', 'agent', 'image_gen'],
}

const resolveOfficialHomeAiModeSections = (groups: OfficialHomeAiSectionGroup[]) =>
  groups.flatMap((group) => OFFICIAL_HOME_AI_SECTION_GROUPS[group])

export const OFFICIAL_HOME_AI_MODE_SECTIONS: Record<OfficialHomeAiMode, HomeSection[]> = {
  agent: resolveOfficialHomeAiModeSections(OFFICIAL_HOME_AI_MODE_SECTION_CODES.agent),
  image_gen: resolveOfficialHomeAiModeSections(OFFICIAL_HOME_AI_MODE_SECTION_CODES.image_gen),
  video_gen: resolveOfficialHomeAiModeSections(OFFICIAL_HOME_AI_MODE_SECTION_CODES.video_gen),
}
```

- [x] **Step 2: Verify green**

```powershell
Push-Location frontend
node --test test/home-ai-mode-sections.test.mjs
Pop-Location
```

Expected: two tests pass; each mode resolves exactly five approved section codes in order.

- [x] **Step 3: Commit focused code and test**

```powershell
git add frontend/src/data/chuangkitHomeAiModesOfficial.ts frontend/test/home-ai-mode-sections.test.mjs
git commit -m "test: cover home AI mode section order"
```

Expected: only those two files are staged; existing unrelated modifications remain untouched.

### Task 3: Run frontend and visual verification

**Files:**

- Verify: `frontend/src/pages/HomePage.tsx`
- Verify: `frontend/src/components/home/HeroSearch.tsx`
- Verify: `frontend/src/components/home/TopicScrollSection.tsx`

- [x] **Step 1: Run all Node tests**

```powershell
Push-Location frontend
node --test test/*.test.mjs
Pop-Location
```

Expected: all discovered tests pass.

- [x] **Step 2: Run lint and production build**

```powershell
Push-Location frontend
npm run lint
npm run build
Pop-Location
```

Expected: `oxlint`, TypeScript, and Vite exit `0`; record actual warnings.

- [x] **Step 3: Verify all mode headings in browser**

Select the three AI hero tabs and check:

```text
Agent: 小红书封面, 营销海报, 亚马逊套图, 商品详情页, 短剧带货
图片生成: 亚马逊套图, 商品详情页, 小红书封面, 营销海报, 短剧带货
视频生成: 短剧带货, 小红书封面, 营销海报, 亚马逊套图, 商品详情页
```

Expected: every mode has all five sections and mode switching clears template-search results.

### Task 4: Write evidence record and check repository gate

**Files:**

- Create: `docs/superpowers/delivery-records/2026-08-25-home-ai-mode-sections.md`
- Verify: `scripts/quality-gate.ps1`

- [x] **Step 1: Write delivery evidence after verification**

Create the record with this content, replacing bracketed entries only after commands run:

```markdown
# AI Delivery Record: 首页 AI 模式五栏内容

## Scope
- Request: 补全 Agent、图片生成、视频生成模式的官网五栏内容。
- In scope: 栏目排序契约、回归测试、前端构建和浏览器检查。
- Out of scope: 后端接口、AI Provider、远程 CDN、模板模式首页内容。

## Design Decisions
- Chosen approach: 从公开的栏目组顺序导出模式的五栏列表，防止手工排序漂移。
- Alternative rejected: 为每种模式复制五个栏目数组，内容更新时容易遗漏。

## Changed Files and Risk Boundary
- Files: `frontend/src/data/chuangkitHomeAiModesOfficial.ts`, `frontend/test/home-ai-mode-sections.test.mjs`。
- Risk classification: low. Only client-side static presentation data changes.

## Verification
- `node --test test/home-ai-mode-sections.test.mjs`: [actual result].
- `node --test test/*.test.mjs`: [actual result].
- `npm run lint`: [actual result].
- `npm run build`: [actual result].
- Browser check: [actual result].
- `pwsh -File scripts/quality-gate.ps1`: not run because `scripts/quality-gate.ps1` is absent; this is an infrastructure gap.

## Residual Risk
- Official inspiration images still depend on the external Chuangkit CDN.
- The repository quality gate referenced by `AGENTS.md` has not yet been added.
```

- [x] **Step 2: Confirm the required quality gate is unavailable**

```powershell
Test-Path scripts/quality-gate.ps1
```

Expected: `False`; do not add unrelated quality-gate infrastructure during this task.

- [x] **Step 3: Validate and commit delivery record**

```powershell
git diff --check
git add docs/superpowers/delivery-records/2026-08-25-home-ai-mode-sections.md
git commit -m "docs: record home AI mode delivery"
git status --short
```

Expected: `git diff --check` has no output. The delivery-record commit includes only that document. Pre-existing unrelated worktree changes remain untouched.

## Plan Self-Review

- **Spec coverage:** Tasks 1-2 make the three approved five-section sequences explicit and proven. Task 3 runs full frontend and visual verification. Task 4 records scope, low risk, evidence, and the missing mandated quality gate.
- **Placeholder scan:** Code, paths, commands, and expected output are concrete. Bracketed record entries intentionally await fresh command output.
- **Type/path consistency:** `OfficialHomeAiSectionGroup` uses the same literal union as `OfficialHomeAiMode`; its values are valid keys; `OFFICIAL_HOME_AI_MODE_SECTIONS` stays a `Record<OfficialHomeAiMode, HomeSection[]>`; the new test lies in existing Node discovery path.
