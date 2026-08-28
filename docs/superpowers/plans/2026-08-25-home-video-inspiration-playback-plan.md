# 首页视频灵感播放 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make official short-drama inspiration cards on the homepage preview and play the official MP4 source.

**Architecture:** Enrich only official video cards with the existing official MP4 mapping. `TopicScrollSection` renders video-capable cards and delegates clicks; `HomePage` adapts a clicked card for the existing `AiCreationDetailModal` instead of duplicating a modal player.

**Tech Stack:** React 19, TypeScript 6, Vite 8, native HTML video, Node built-in test runner.

---

## File Map

- Modify: `frontend/src/types/index.ts` - add an optional card video URL.
- Modify: `frontend/src/data/chuangkitHomeAiModesOfficial.ts` - derive short-drama MP4 URLs from the official inspiration mapping.
- Modify: `frontend/src/components/home/TopicScrollSection.tsx` - preview video cards and surface card click events.
- Modify: `frontend/src/pages/HomePage.tsx` - open a clicked homepage video in the existing creation detail modal.
- Create: `frontend/test/home-video-inspiration-playback.test.mjs` - cover official video data and homepage/component wiring.
- Create: `docs/superpowers/delivery-records/2026-08-25-home-video-inspiration-playback.md` - record scope, evidence, and signed-source risk after verification.

### Task 1: Add the failing regression test

- [x] Create a Node test that runtime-loads `chuangkitHomeAiModesOfficial.ts` and asserts every `official-short-drama` card has an `https://` URL containing `.mp4` and `sign=`.
- [x] Assert the homepage stores a selected video card, passes `onCardClick` to AI-mode sections, and mounts `AiCreationDetailModal`.
- [x] Assert `TopicScrollSection` renders a native `<video>` only for `card.videoUrl` and routes clicks to the video callback.
- [x] Run `node --test test/home-video-inspiration-playback.test.mjs`; it failed as expected because the new data and callbacks did not exist.

### Task 2: Enrich official short-drama cards

- [x] Add `videoUrl?: string` to `HomeSectionCard`.
- [x] Read `AI_VIDEO_INSPIRATION_MEDIA` through its existing key helper when creating `official-short-drama`; attach its `video` value to each card.
- [x] Re-run the focused test; it passed after the component and page wiring were complete.

### Task 3: Connect preview and modal playback

- [x] Extend `TopicScrollSection` with a card callback and render a muted looped inline preview for cards with `videoUrl`; retain images for cards without it.
- [x] In `HomePage`, use a selected-card state and adapt the card to `AiTopicInspiration`, then mount `AiCreationDetailModal` with its title, index, and source URL.
- [x] Preserve `onTemplateClick` for non-video cards, closing the modal clears selected state.
- [x] Run the focused test and confirm it passes.

### Task 4: Verify and record delivery

- [x] Request bytes `0-1` from the first official URL and confirm `206`, `video/mp4`, and a content range.
- [x] Open `http://localhost:5173`, select video generation, click “酒水”, and confirm the modal video reaches a playable state.
- [x] Run `node --test test/*.test.mjs`, `npm run lint`, `npm run build`, and `git diff --check` from `frontend`/repository as applicable.
- [x] Check `scripts/quality-gate.ps1`; it remains absent.
- [x] Add a delivery record with actual outcomes and commit documentation only, leaving unrelated worktree changes untouched.
