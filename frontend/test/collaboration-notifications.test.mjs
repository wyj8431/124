import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const messageServiceSource = await readFile(new URL('../../backend/src/main/java/com/chuangkit/admin/service/MessageCenterService.java', import.meta.url), 'utf8')
const collaborationServiceSource = await readFile(new URL('../../backend/src/main/java/com/chuangkit/admin/service/CollaborationService.java', import.meta.url), 'utf8')
const frontendMessageTypes = await readFile(new URL('../src/types/messageCenter.ts', import.meta.url), 'utf8')
const notificationBellSource = await readFile(new URL('../src/components/common/NotificationBell.tsx', import.meta.url), 'utf8')
const messageHookSource = await readFile(new URL('../src/hooks/useMessageCenter.ts', import.meta.url), 'utf8')

test('message center exposes a collaboration category', () => {
  assert.match(messageServiceSource, /"collaboration"\s*,\s*"协作通知"/)
  assert.match(messageServiceSource, /tab\("collaboration"/)
  assert.match(frontendMessageTypes, /collaboration/)
})

test('team comments and versions create notifications for other members', () => {
  assert.match(collaborationServiceSource, /UserMessageMapper/)
  assert.match(collaborationServiceSource, /notifyTeamMembers/)
  assert.match(collaborationServiceSource, /团队评论更新/)
  assert.match(collaborationServiceSource, /新版本快照已创建/)
})

test('top-level notification bell exposes unread count and refreshes it', () => {
  assert.match(notificationBellSource, /useMessageCenterIndex\(isLoggedIn\)/)
  assert.match(notificationBellSource, /notification-bell__badge/)
  assert.match(notificationBellSource, /99\+/)
  assert.match(messageHookSource, /refetchInterval:\s*enabled \? 30_000 : false/)
})
