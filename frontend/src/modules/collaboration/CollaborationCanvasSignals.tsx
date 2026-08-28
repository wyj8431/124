// 工单编号：网站学院-All poster低代码开发平台项目-海报多人协作编辑任务工单

import type { CollaborationActor, CollaborationCursor, LayerLockPayload } from './collaborationBridge'

export interface RemoteCursor extends CollaborationActor, CollaborationCursor {
  updatedAt: number
}

interface CollaborationCanvasSignalsProps {
  cursors: RemoteCursor[]
  locks: Map<string, CollaborationActor>
  layerId?: string
}

export default function CollaborationCanvasSignals({ cursors, locks, layerId }: CollaborationCanvasSignalsProps) {
  const lockOwner = layerId ? locks.get(layerId) : undefined
  return (
    <>
      {lockOwner ? <span className="design-editor-layer-lock" style={{ borderColor: lockOwner.color, color: lockOwner.color }}>由 {lockOwner.name} 编辑</span> : null}
      {cursors.map((cursor) => (
        <span
          key={cursor.id}
          className="design-editor-remote-cursor"
          style={{ left: cursor.x, top: cursor.y, color: cursor.color }}
          aria-label={`${cursor.name} 的光标`}
        >
          <i style={{ borderBottomColor: cursor.color }} />
          <b style={{ background: cursor.color }}>{cursor.name}</b>
        </span>
      ))}
    </>
  )
}

export type { LayerLockPayload }
