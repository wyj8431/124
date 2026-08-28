// 工单编号：网站学院-All poster低代码开发平台项目-海报多人协作编辑任务工单

export const COLLABORATION_EVENT_TYPES = ['cursor', 'document-update', 'layer-lock', 'layer-unlock', 'presence'] as const

export type CollaborationEventType = typeof COLLABORATION_EVENT_TYPES[number]

export interface CollaborationActor {
  id: string
  name: string
  color: string
}

export interface CollaborationCursor {
  x: number
  y: number
}

export interface CollaborationEvent<T = unknown> {
  channel: 'poster-collaboration'
  designId: number
  type: CollaborationEventType
  actor: CollaborationActor
  payload: T
  sentAt: number
}

export interface LayerLockPayload {
  layerId: string
}

export interface CollaborationBridge {
  publish: <T>(type: CollaborationEventType, payload: T) => void
  subscribe: (listener: (event: CollaborationEvent) => void) => () => void
  close: () => void
}

const PALETTE = ['#0f8bff', '#16a34a', '#e11d48', '#9333ea', '#ea580c', '#0891b2']

export function collaborationColor(seed: string | number) {
  const value = String(seed)
  let hash = 0
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

export function isCollaborationEvent(value: unknown): value is CollaborationEvent {
  if (!value || typeof value !== 'object') return false
  const event = value as Partial<CollaborationEvent>
  return event.channel === 'poster-collaboration'
    && Number.isFinite(event.designId)
    && typeof event.type === 'string' && COLLABORATION_EVENT_TYPES.includes(event.type as CollaborationEventType)
    && typeof event.sentAt === 'number'
    && !!event.actor
    && typeof event.actor.id === 'string'
}

export function createCollaborationBridge(designId: number, actor: CollaborationActor): CollaborationBridge {
  const channelName = `poster-collaboration:${designId}`
  const storageKey = `${channelName}:event`
  const listeners = new Set<(event: CollaborationEvent) => void>()
  const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(channelName)
  const abortController = typeof AbortController === 'undefined' ? null : new AbortController()
  let documentPublishTimer: number | null = null
  let pendingDocumentPayload: unknown = null
  let reconnectTimer: number | null = null
  let reconnectDelay = 1_000
  let closed = false

  const emit = (value: unknown) => {
    if (!isCollaborationEvent(value) || value.designId !== designId || value.actor.id === actor.id) return
    listeners.forEach((listener) => listener(value))
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey || !event.newValue) return
    try {
      emit(JSON.parse(event.newValue))
    } catch {
      // Ignore malformed events from stale browser tabs.
    }
  }

  channel?.addEventListener('message', (event) => emit(event.data))
  if (!channel && typeof window !== 'undefined') window.addEventListener('storage', onStorage)

  const token = typeof window === 'undefined' ? null : window.localStorage.getItem('ckt_token')
  const serverUrl = `/admin/collaboration/designs/${designId}/events`

  const scheduleReconnect = () => {
    if (closed || !token || !abortController || reconnectTimer !== null || typeof window === 'undefined') return
    const delay = reconnectDelay
    reconnectDelay = Math.min(15_000, reconnectDelay * 2)
    reconnectTimer = window.setTimeout(connectToServer, delay)
  }

  const connectToServer = async () => {
    reconnectTimer = null
    if (closed || !token || !abortController || typeof fetch === 'undefined') return
    try {
      const response = await fetch(serverUrl, { headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' }, signal: abortController.signal })
      if (!response.ok || !response.body) {
        scheduleReconnect()
        return
      }
      reconnectDelay = 1_000
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (!closed && !abortController.signal.aborted) {
        const chunk = await reader.read()
        if (chunk.done) break
        buffer += decoder.decode(chunk.value, { stream: true })
        const messages = buffer.split(/\r?\n\r?\n/)
        buffer = messages.pop() || ''
        for (const message of messages) {
          const data = message.split(/\r?\n/).find((line) => line.startsWith('data:'))?.slice(5).trim()
          if (!data || data === 'connected') continue
          try {
            const parsed = JSON.parse(data) as { type?: string; actorId?: string; actorName?: string; actorColor?: string; payload?: unknown; sentAt?: number }
            emit({ channel: 'poster-collaboration', designId, type: parsed.type as CollaborationEventType, actor: { id: String(parsed.actorId || ''), name: parsed.actorName || '团队成员', color: parsed.actorColor || collaborationColor(parsed.actorId || '') }, payload: parsed.payload, sentAt: parsed.sentAt || Date.now() })
          } catch {
            // Ignore malformed server events and keep the stream alive.
          }
        }
      }
    } catch {
      // The existing revision polling remains the fallback when SSE is unavailable.
    }
    if (!closed && !abortController.signal.aborted) {
      scheduleReconnect()
    }
  }
  void connectToServer()

  const publishToServer = (type: CollaborationEventType, payload: unknown) => {
    if (!token || typeof fetch === 'undefined') return
    const serverPayload = payload && typeof payload === 'object' ? { ...(payload as Record<string, unknown>), actorColor: actor.color } : { value: payload, actorColor: actor.color }
    void fetch(serverUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ type, payload: serverPayload }) }).catch(() => undefined)
  }

  return {
    publish: (type, payload) => {
      const event: CollaborationEvent = { channel: 'poster-collaboration', designId, type, actor, payload, sentAt: Date.now() }
      if (channel) channel.postMessage(event)
      else if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, JSON.stringify(event))
        window.localStorage.removeItem(storageKey)
      }
      if (type === 'document-update') {
        pendingDocumentPayload = payload
        if (documentPublishTimer === null && typeof window !== 'undefined') {
          documentPublishTimer = window.setTimeout(() => {
            publishToServer('document-update', pendingDocumentPayload)
            pendingDocumentPayload = null
            documentPublishTimer = null
          }, 120)
        }
      } else {
        publishToServer(type, payload)
      }
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    close: () => {
      closed = true
      listeners.clear()
      channel?.close()
      abortController?.abort()
      if (reconnectTimer !== null && typeof window !== 'undefined') window.clearTimeout(reconnectTimer)
      if (documentPublishTimer !== null && typeof window !== 'undefined') window.clearTimeout(documentPublishTimer)
      if (!channel && typeof window !== 'undefined') window.removeEventListener('storage', onStorage)
    },
  }
}
