# AI 抠图本地演示版交付记录

## Scope

- Implemented a local mock matting flow for `/editor/koutu`.
- Reused `POST /admin/ai/upload`, `POST /admin/matting/tasks`, `GET /admin/matting/tasks/{id}` and the existing `ai_task` table.
- Added server/client validation for JPEG, PNG and GIF images up to 5 MB.
- Added upload and processing states, error feedback, retry, result/original preview, transparent-image download and continue-editing action.
- Added a replaceable `MattingProvider` boundary. Real endpoint/database providers remain first priority; local mock is used only when no real provider is available and `AI_MATTING_MOCK_ENABLED=true`.
- Fixed Windows static upload resource mapping and made polling state updates idempotent so unchanged task responses do not restart the timer.

## Data And Security

- No database schema or migration changes.
- User ownership remains enforced by `SecurityUtils.requireUserId()` and the `ai_task.user_id` query condition.
- Mock source paths are reduced to safe filenames under the local `uploads` directory; traversal paths are rejected.
- Provider API keys remain backend-only environment configuration.
- Mock output is explicitly labeled in the UI and is not production AI quality.

## Verification Evidence

Commands run from `C:\Users\魏宇杰\Desktop\666\创客贴`:

- `backend\mvnw -q test`: passed.
- `frontend\npm test`: 41 passed, 0 failed.
- `frontend\npm run build`: passed.
- `pwsh -File scripts/quality-gate.ps1`: `QUALITY GATE PASSED`.
- Codex changed-file review: high `0`, medium `0`; existing info findings are unrelated missing-focused-test notices in the dirty workspace.
- `git diff --check`: passed.
- Browser smoke test at `http://127.0.0.1:5173/editor/koutu`: upload -> task polling -> `本地演示结果` card -> PNG output URL; API requests returned 200 and only two status polls were needed after the task was created.

## Residual Risks And Follow-up

- The browser demo now runs MediaPipe person segmentation before upload, producing a PNG whose alpha channel contains only the person. The backend Mock Provider remains a replaceable task-flow fallback; replace it with the real `MattingProvider` implementation after endpoint and key provisioning for production quality.
- The continue-editing route currently opens the existing editor entry with a `source` query; the editor can later consume that URL when its image-layer import contract is finalized.
- Lint retains existing repository warnings for Fast Refresh exports and one unrelated hook dependency; no new error was introduced.
- Human review of this high-risk upload/API change is still required before production release.
