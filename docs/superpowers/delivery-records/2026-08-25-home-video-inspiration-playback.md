# AI Delivery Record: 首页视频灵感播放

## Scope

- Request: 从官网采集可播放视频并接入当前项目首页。
- In scope: 首页视频生成模式的短剧带货卡片、官网 MP4 映射复用、详情播放器接线、回归测试和浏览器验收。
- Out of scope: AI Provider 配置、生成任务的真实产物、视频下载或 CDN 代理、非视频灵感卡片的交互。

## Changed Files and Decisions

- `frontend/src/types/index.ts`: `HomeSectionCard` 增加可选 `videoUrl`。
- `frontend/src/data/chuangkitHomeAiModesOfficial.ts`: 仅 `official-short-drama` 卡片从既有 `AI_VIDEO_INSPIRATION_MEDIA` 官网映射获取签名 MP4。
- `frontend/src/components/home/TopicScrollSection.tsx`: 有视频地址的卡片悬停静音预览，点击通过独立回调上报；无视频地址的卡片保持模板点击行为。
- `frontend/src/pages/HomePage.tsx`: 将选中的视频卡片适配为专题灵感并复用 `AiCreationDetailModal`，关闭后清空选择。
- `frontend/test/home-video-inspiration-playback.test.mjs`: 回归保护官方 URL 和播放器接线。
- `frontend/test/home-ai-mode-sections.test.mjs`: 测试加载器显式注入新增的官方媒体模块依赖。

## Verification

- 官网专题页 `https://www.chuangkit.com/designtools/aitopic/aishipin`: HTTP `200`。
- 第一条官方 MP4 的 `Range: bytes=0-1`: HTTP `206`，`Content-Type: video/mp4`，`Content-Range: bytes 0-1/3293741`。
- `node --test test/home-video-inspiration-playback.test.mjs`: PASS, 2 tests.
- `node --test test/*.test.mjs`: PASS, 35 tests.
- `npm run lint`: PASS, exit `0`; existing React-rule warnings remain.
- `npm run build`: PASS, exit `0`; existing Vite `__dirname` and chunk-size warnings remain.
- Browser at `http://localhost:5173`: PASS. In video-generation mode, hovering “酒水” played its card video. Clicking it opened the existing detail dialog; the main video reported `readyState=4`, `paused=false`, duration `15.069002`, no media error. Official MP4 requests returned `206`.
- `git diff --check`: PASS, no whitespace errors.
- `pwsh -File scripts/quality-gate.ps1`: NOT RUN because `scripts/quality-gate.ps1` is absent.

## Residual Risk

- Official MP4 URLs are signed CDN resources and must be refreshed with the existing inspiration-media source when they expire.
- The repository-level quality-gate script required by project guidance is not present.
- Real AI-generated video output still requires the missing provider environment configuration and was not changed in this request.

## Follow-up Fix: Visible Playback Controls

- Symptom: the homepage card area could show a poster frame without an obvious play affordance, and the homepage detail player hid native controls.
- Fix: add a visible Lucide play badge to video cards and expose native controls through the `showControls` prop for the homepage detail modal.
- Focused verification: `node --test test/home-video-inspiration-playback.test.mjs` passed, 3 tests.
- Browser verification: 7 play badges rendered in the video section; the first card reported `readyState=4`, duration `15.069002`; after clicking “酒水”, the detail video had a `controls` attribute, `readyState=4`, `paused=false`, and no media error.
- Full-suite status: `node --test test/*.test.mjs` reported 36 passing and 1 pre-existing failure in `design-editor-collaboration.test.mjs`; that test expects `design-editor-shell--figma`, which is absent from the unrelated current editor worktree and was not changed here.
- `npm run lint`: exit `0` with existing React rule warnings.
- `npm run build`: exit `0` with existing Vite config and chunk-size warnings.

## Follow-up Fix: Seven-Column Full Video Frame

- Symptom: the homepage video cards were displayed in a shorter desktop frame, and the preview used cover fitting that could crop parts of the portrait video.
- Fix: video sections now keep a seven-column desktop grid; video cards use a `9 / 16` portrait frame with `object-fit: contain`, including the poster fallback.
- Focused regression: `frontend/test/home-video-inspiration-playback.test.mjs` asserts the seven-column rule, portrait ratio, and contain fitting; it passed 4/4 before the final dependency refresh.
- Verification: `git diff --check` passed; `npm run lint` passed with existing warnings; `npm run build` passed; `node scripts/codex-code-review.mjs --scope changed-files --format json --severity medium` reported zero findings. `scripts/quality-gate.ps1` reached governance tests (18 passing) but stopped at `npm ci` because Windows returned `EPERM` while unlinking the in-use `lightningcss.win32-x64-msvc.node`; that interrupted refresh left `frontend/node_modules/typescript` incomplete, so a later full-suite run had 91 passing tests and 2 dependency-resolution failures. The preview endpoint was not listening when checked, so browser screenshot verification was unavailable.

## Follow-up Fix: Visible Video Card Labels

- Symptom: after the video frame was expanded to preserve the entire portrait preview, the label below each video could fall outside the clipped desktop scroll area.
- Fix: video-card labels now reserve a 32 px text area below the frame and use the plain caption treatment shown in the reference; the video grid permits the label area to render outside its media-height boundary.
- Focused verification: `node --test test/home-video-inspiration-playback.test.mjs` passed 5/5, including the label visibility contract.
- Verification: after stopping the stale Vite process that held the native Lightning CSS module lock, `npm ci --include=dev --ignore-scripts` restored all frontend dependencies successfully. `npm run lint` and `npm run build` passed with the repository's existing warnings. Browser verification at `http://127.0.0.1:5173/` confirmed the Vite error overlay is gone; in 视频生成 mode, the first label “酒水” renders as a visible 32 px block and its bottom aligns with the video-grid bottom. The remaining console messages are an unrelated remote-avatar `404` and two expected unauthorized AI-configuration `403` responses.
