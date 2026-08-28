import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const bridgeSource = await readFile(new URL('../src/modules/collaboration/collaborationBridge.ts', import.meta.url), 'utf8')

test('bridge validates the collaboration event whitelist and reconnects bounded SSE streams', () => {
  assert.match(bridgeSource, /COLLABORATION_EVENT_TYPES/)
  assert.match(bridgeSource, /COLLABORATION_EVENT_TYPES\.includes\(event\.type as CollaborationEventType\)/)
  assert.match(bridgeSource, /reconnectDelay/)
  assert.match(bridgeSource, /setTimeout\(connectToServer/)
  assert.match(bridgeSource, /Math\.min\(15_000/)
  assert.match(bridgeSource, /reconnectTimer/)
})

test('bridge close aborts the stream and cancels queued reconnect work', () => {
  assert.match(bridgeSource, /abortController\?\.abort\(\)/)
  assert.match(bridgeSource, /clearTimeout\(reconnectTimer\)/)
  assert.match(bridgeSource, /closed = true/)
})
