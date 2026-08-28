# 海报多人协作编辑实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 补齐现有海报编辑器多人协作工单的实时事件、冲突处理和 SSE 生命周期能力，并用测试证明分享、保存、版本和导出回归不受影响。

**Architecture:** 保持现有 `React.lazy + collaborationBridge + BroadcastChannel/SSE` 独立协作模块，不引入 qiankun/无界。前端桥接器负责传输和清理，编辑器负责局部协作状态与图层锁冲突，后端 Controller 负责认证，Request 负责事件白名单校验，Broker 负责有限 SSE 连接和心跳；数据库和既有 REST 契约不变。

**Tech Stack:** React 19、Vite、TypeScript、Node test runner、Spring Boot 3.2、Java 21、Spring MVC `SseEmitter`、Jakarta Validation、JUnit 5、Mockito。

**Spec:** `docs/superpowers/specs/2026-08-27-poster-collaboration-workorder-design.md`

## Global Constraints

- 工单编号：`网站学院-All poster低代码开发平台项目-海报多人协作编辑任务工单`。
- 不新增 qiankun、无界或其他 npm/Maven 依赖。
- 不新增或修改数据库表、索引和迁移。
- 不改变已有 REST/SSE 路径、认证方式、分享 token、版本和 `revision` 语义。
- 服务端不得信任客户端 actor 身份字段；每次订阅和发布继续校验设计团队权限。
- SSE 连接必须有限超时、定时心跳、异常清理；前端关闭时必须 abort 并清理重连 timer。
- 所有行为变更先写失败测试；禁止自动执行 `git add`、`git commit`、`git push`。

---

### Task 1: Harden The Collaboration Bridge

**Files:**
- Modify: `frontend/src/modules/collaboration/collaborationBridge.ts`
- Create: `frontend/test/collaboration-bridge.test.mjs`
- Modify: `frontend/test/design-editor-realtime.test.mjs`

**Interfaces:**
- Consumes: existing `CollaborationEvent`, `CollaborationBridge`, `CollaborationActor` types and `/admin/collaboration/designs/{designId}/events` endpoint.
- Produces: runtime event whitelist through `COLLABORATION_EVENT_TYPES`, reconnecting SSE reader with exponential backoff capped at 15 seconds, and `close()` that prevents future reconnects.

- [ ] **Step 1: Write the failing source-contract tests**

Add `frontend/test/collaboration-bridge.test.mjs` with assertions for the intended bridge contract:

```js
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const bridgeSource = await readFile(new URL('../src/modules/collaboration/collaborationBridge.ts', import.meta.url), 'utf8')

test('bridge validates the event whitelist and reconnects bounded SSE streams', () => {
  assert.match(bridgeSource, /COLLABORATION_EVENT_TYPES/)
  assert.match(bridgeSource, /event\.type.*COLLABORATION_EVENT_TYPES/)
  assert.match(bridgeSource, /reconnectDelay/)
  assert.match(bridgeSource, /setTimeout\(connectToServer/)
  assert.match(bridgeSource, /Math\.min\(15_000/)
  assert.match(bridgeSource, /reconnectTimer/)
})

test('bridge close aborts the reader and cancels reconnect work', () => {
  assert.match(bridgeSource, /abortController\?\.abort\(\)/)
  assert.match(bridgeSource, /clearTimeout\(reconnectTimer\)/)
  assert.match(bridgeSource, /closed/)
})
```

Extend `frontend/test/design-editor-realtime.test.mjs` with an assertion that malformed and unknown event types are rejected by the bridge guard.

- [ ] **Step 2: Run the focused tests and verify they fail for missing bridge behavior**

Run: `npm test -- --test-name-pattern="bridge"` from `frontend`.

Expected: FAIL because the source does not yet declare the event whitelist and reconnect lifecycle symbols.

- [ ] **Step 3: Implement the smallest bridge changes**

In `collaborationBridge.ts`:

1. Declare `const COLLABORATION_EVENT_TYPES = ['cursor', 'document-update', 'layer-lock', 'layer-unlock', 'presence'] as const` and derive `CollaborationEventType` from it, preserving the exported type name.
2. Update `isCollaborationEvent` to require `typeof event.type === 'string' && COLLABORATION_EVENT_TYPES.includes(event.type as CollaborationEventType)`.
3. Replace the one-shot `readServerEvents` call with a `connectToServer` function that checks `closed`, fetches the SSE endpoint with the existing token and abort signal, parses complete SSE frames, resets delay after a successful response, and schedules reconnects at 1s, 2s, 4s, 8s, then 15s after errors or stream completion.
4. Track `closed`, `reconnectTimer`, and `reconnectDelay`; make `close()` set `closed`, abort the controller, clear the reconnect timer, clear the document publish timer, close BroadcastChannel, and remove the storage listener.
5. Keep the existing 120ms document-event coalescing and local BroadcastChannel/storage delivery unchanged.

- [ ] **Step 4: Run the bridge and existing realtime tests**

Run: `npm test -- --test-name-pattern="bridge|collaboration bridge|collaboration canvas signals"` from `frontend`.

Expected: PASS with no new warnings.

- [ ] **Step 5: Run the TypeScript build for the bridge contract**

Run: `npm run build` from `frontend`.

Expected: exit code 0.

### Task 2: Secure And Bound The Backend SSE Broker

**Files:**
- Modify: `backend/src/main/java/com/chuangkit/admin/dto/CollaborationEventRequest.java`
- Modify: `backend/src/main/java/com/chuangkit/admin/service/CollaborationEventBroker.java`
- Create: `backend/src/test/java/com/chuangkit/admin/service/CollaborationEventBrokerTest.java`
- Create: `backend/src/test/java/com/chuangkit/admin/dto/CollaborationEventRequestTest.java`

**Interfaces:**
- Consumes: existing `CollaborationEventController` calls to `subscribe(channel)` and `publish(channel, event)`.
- Produces: the same `SseEmitter` and publish methods with a 30-minute connection limit, 25-second heartbeat, and idempotent subscriber cleanup; request validation rejects event types outside the five-event whitelist.

- [ ] **Step 1: Write failing backend tests**

Create `CollaborationEventRequestTest.java` using the Jakarta Validator from Spring Boot test dependencies:

```java
@Test
void rejectsUnknownEventType() {
    CollaborationEventRequest request = new CollaborationEventRequest();
    request.setType("delete-all");
    Set<ConstraintViolation<CollaborationEventRequest>> violations = validator.validate(request);
    assertThat(violations).anyMatch(v -> v.getMessage().contains("协作事件类型"));
}

@Test
void acceptsDocumentUpdateEventType() {
    CollaborationEventRequest request = new CollaborationEventRequest();
    request.setType("document-update");
    assertThat(validator.validate(request)).isEmpty();
}
```

Create `CollaborationEventBrokerTest.java` with source-independent lifecycle assertions using reflection only for the private subscriber map and Mockito for a failed emitter path:

```java
@Test
void subscribeUsesFiniteTimeoutAndRegistersHeartbeatCleanup() throws Exception {
    SseEmitter emitter = broker.subscribe("team:design");
    assertThat(emitter).isNotNull();
    Field subscribers = CollaborationEventBroker.class.getDeclaredField("subscribers");
    subscribers.setAccessible(true);
    Map<?, ?> channels = (Map<?, ?>) subscribers.get(broker);
    assertThat(channels).containsKey("team:design");
    assertThat(CollaborationEventBroker.class.getDeclaredField("SSE_TIMEOUT_MS").getLong(null)).isEqualTo(30 * 60 * 1000L);
}
```

Add a test that invokes the registered completion callback through a test helper or verifies the broker source declares `ScheduledFuture`, `heartbeat`, `onCompletion`, `onTimeout`, and `onError` cleanup paths. Keep tests deterministic and do not sleep for 25 seconds.

- [ ] **Step 2: Run the focused Maven tests and verify the contract tests fail**

Run: `./mvnw.cmd -q -Dtest=CollaborationEventBrokerTest,CollaborationEventRequestTest test` from `backend`.

Expected: FAIL because the finite timeout constant, heartbeat task, and request pattern are not implemented yet.

- [ ] **Step 3: Implement request validation and Broker lifecycle**

1. Add `@Pattern(regexp = "cursor|document-update|layer-lock|layer-unlock|presence", message = "协作事件类型不受支持")` beside `@NotBlank` on `CollaborationEventRequest.type`.
2. Add `static final long SSE_TIMEOUT_MS = 30 * 60 * 1000L`, a daemon `ScheduledExecutorService`, and a `ConcurrentHashMap<String, CopyOnWriteArrayList<SseEmitter>>` subscriber map.
3. Create each emitter with `new SseEmitter(SSE_TIMEOUT_MS)`.
4. Register one idempotent cleanup runnable with completion, timeout, and error callbacks. Store a `ScheduledFuture<?>` per subscription and cancel it during cleanup.
5. Schedule a 25-second task that sends `SseEmitter.event().comment("heartbeat")`; remove the emitter when heartbeat or business-event send throws `IOException`.
6. Keep the initial `ready`/`connected` event and `publish` payload shape unchanged.
7. Add `@PreDestroy` to shut down the scheduler and remove/cancel all subscribers without blocking application shutdown.

- [ ] **Step 4: Run backend focused tests and existing collaboration tests**

Run: `./mvnw.cmd -q -Dtest=CollaborationEventBrokerTest,CollaborationEventRequestTest,CollaborationServiceTest,DesignShareServiceTest test` from `backend`.

Expected: PASS.

- [ ] **Step 5: Run backend compilation**

Run: `./mvnw.cmd -q -DskipTests compile` from `backend`.

Expected: exit code 0.

### Task 3: Make Editor Layer Locks Conflict-Safe

**Files:**
- Modify: `frontend/src/pages/DesignEditorPage.tsx`
- Modify: `frontend/test/design-editor-realtime.test.mjs`
- Modify: `frontend/test/design-editor-collaboration.test.mjs`

**Interfaces:**
- Consumes: bridge events `layer-lock`, `layer-unlock`, `presence`, and the existing drag/resize pointer refs.
- Produces: remote lock expiry after 30 seconds, immediate cancellation of local drag/resize on a competing lock, presence event propagation, and unlock cleanup on pointer end, component cleanup, and page hide.

- [ ] **Step 1: Add failing editor source-contract tests**

Append tests to `frontend/test/design-editor-realtime.test.mjs`:

```js
test('editor expires stale remote locks and aborts a competing local pointer operation', () => {
  assert.match(editorSource, /lockTimestampsRef/)
  assert.match(editorSource, /30_000/)
  assert.match(editorSource, /releaseActivePointerCapture/)
  assert.match(editorSource, /dragRef\.current = null/)
  assert.match(editorSource, /resizeRef\.current = null/)
  assert.match(editorSource, /远端锁冲突/)
})

test('editor releases local locks when the collaboration surface is disposed', () => {
  assert.match(editorSource, /localLockIdsRef/)
  assert.match(editorSource, /pagehide/)
  assert.match(editorSource, /publish\('layer-unlock'/)
})
```

Append a presence assertion to `frontend/test/design-editor-collaboration.test.mjs` for `publish('presence'` and the event handler branch.

- [ ] **Step 2: Run the focused editor tests and verify they fail**

Run: `npm test -- --test-name-pattern="editor expires|editor releases local locks|presence"` from `frontend`.

Expected: FAIL because the new lock lifecycle symbols and event branches do not exist.

- [ ] **Step 3: Implement lock ownership and conflict handling**

In `DesignEditorPage.tsx`:

1. Add `lockTimestampsRef`, `localLockIdsRef`, and `activePointerCaptureRef` refs. The capture ref stores `{ element: HTMLElement; pointerId: number }`.
2. Add `releaseActivePointerCapture()` that checks `hasPointerCapture` before releasing and clears the ref.
3. In the bridge subscription, record timestamps for remote `layer-lock` events. If the event targets the current local drag/resize layer, clear both operation refs, release capture, remove the local lock id, publish `layer-unlock`, and set an inline notice containing `远端锁冲突` and the actor name. Otherwise update `layerLocks` as before.
4. Add an effect with a 5-second interval that removes remote lock entries whose timestamp is older than 30 seconds; clear the interval on unmount.
5. When drag or resize starts, add the layer id to `localLockIdsRef` and store the pointer capture target. On pointer up/cancel, remove the id, release capture, and publish `layer-unlock`.
6. In the collaboration effect cleanup and a `pagehide` listener, publish `layer-unlock` for every id in `localLockIdsRef`, then clear the set. Keep `bridge.close()` as the final cleanup.
7. On REST presence heartbeat, publish `presence` with `{ status: 'online' }`; handle incoming presence events by updating the matching numeric user id in `presences` without duplicating entries. Invalid status payloads are ignored.
8. Preserve existing save conflict behavior, remote revision banner, read-only share guard, comments, versions, and export controls.

- [ ] **Step 4: Run all frontend collaboration and editor tests**

Run: `npm test -- --test-name-pattern="collaboration|editor|share|export"` from `frontend`.

Expected: PASS.

- [ ] **Step 5: Run frontend lint and build**

Run: `npm run lint` from `frontend`, then `npm run build` from `frontend`.

Expected: both commands exit 0 with no TypeScript or lint errors.

### Task 4: Record Delivery And Run The Repository Gate

**Files:**
- Create: `docs/superpowers/delivery-records/2026-08-27-poster-collaboration-workorder.md`
- Modify: `docs/engineering/ai-code-standard.md` only if the implementation changes an engineering standard; otherwise leave it unchanged.

**Interfaces:**
- Consumes: completed changes and fresh command output from Tasks 1-3.
- Produces: an auditable delivery record with scope, risks, exact verification commands, review output, and residual risks.

- [ ] **Step 1: Write the failing documentation checklist locally**

Before creating the delivery record, run this read-only check and confirm the target record is absent:

Run: `Test-Path docs/superpowers/delivery-records/2026-08-27-poster-collaboration-workorder.md` from the repository root.

Expected: `False`.

- [ ] **Step 2: Create the delivery record with actual evidence fields**

Use the existing `docs/engineering/ai-delivery-record-template.md` headings. Record:

- Request and explicit out-of-scope qiankun/无界 and schema changes.
- Changed files and medium risk classification.
- Exact results for focused frontend tests, frontend lint/build, focused Maven tests, Maven compile, full quality gate, and changed-files code review.
- SSE/security impact, compatibility, rollback procedure, and unverified cross-device browser checks.

Do not write `PASS` until the command has run in this task.

- [ ] **Step 3: Run the required repository quality gate**

Run: `pwsh -File scripts/quality-gate.ps1` from the repository root.

Expected: all stages complete, ending with `QUALITY GATE PASSED`. If a stage cannot run because a required runtime is missing, record the exact output and do not call the gate passed.

- [ ] **Step 4: Run the required changed-files review**

Run: `node scripts/codex-code-review.mjs --scope changed-files --format json` from the repository root.

Expected: no high or medium findings. Fix any such finding and rerun the command before delivery.

- [ ] **Step 5: Inspect the final diff without staging**

Run: `git diff --check` and `git status --short` from the repository root.

Expected: no whitespace errors; only scoped implementation, test, spec/plan, and delivery files are changed. Leave staging, commit, and push to the human reviewer.
