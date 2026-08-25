import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  History,
  ImagePlus,
  MessageSquarePlus,
  Plus,
  Redo2,
  RefreshCw,
  Save,
  Trash2,
  Type,
  Undo2,
  Upload,
  UsersRound,
} from 'lucide-react'
import { ApiError, designApi, aiApi, teamApi, usageApi } from '@/api'
import { LoginModal } from '@/components/auth/LoginModal'
import { useAuth } from '@/context/AuthContext'
import type { UserDesign } from '@/types'
import type { TeamComment, TeamOverview, TeamPresence, TeamVersion } from '@/types/team'
import { cn } from '@/utils'
import '@/styles/collaboration-comments.css'

type LayerType = 'text' | 'image'

interface EditorLayer {
  id: string
  type: LayerType
  x: number
  y: number
  width: number
  height: number
  content?: string
  src?: string
  fontSize?: number
  fontWeight?: number
  color?: string
  opacity?: number
}

interface CanvasDocument {
  version: string
  width: number
  height: number
  background: string
  layers: EditorLayer[]
}

type InspectorTab = 'properties' | 'collaboration'

const DEFAULT_WIDTH = 800
const DEFAULT_HEIGHT = 600

function emptyDocument(width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT): CanvasDocument {
  return {
    version: '1.0',
    width,
    height,
    background: '#ffffff',
    layers: [],
  }
}

function parseDocument(design?: UserDesign) {
  const fallback = emptyDocument(design?.width || DEFAULT_WIDTH, design?.height || DEFAULT_HEIGHT)
  if (!design?.canvasJson) return fallback
  try {
    const parsed = JSON.parse(design.canvasJson) as Partial<CanvasDocument>
    return mergeDocument(parsed, fallback)
  } catch {
    return fallback
  }
}

function mergeDocument(parsed: Partial<CanvasDocument>, fallback: CanvasDocument): CanvasDocument {
  return {
    ...fallback,
    ...parsed,
    width: Number(parsed.width) || fallback.width,
    height: Number(parsed.height) || fallback.height,
    background: parsed.background || fallback.background,
    layers: Array.isArray(parsed.layers) ? parsed.layers : fallback.layers,
  }
}

function cloneDocument(document: CanvasDocument): CanvasDocument {
  return JSON.parse(JSON.stringify(document)) as CanvasDocument
}

function createLayerId() {
  return `layer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function formatCollaborationTime(value?: string | null) {
  if (!value) return '刚刚'
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}

function memberName(member: Pick<TeamPresence, 'username' | 'nickname'>) {
  return member.nickname || member.username || '团队成员'
}

export function DesignEditorPage() {
  const { id: idParam } = useParams()
  const navigate = useNavigate()
  const designId = Number(idParam)
  const { isLoggedIn, setShowLoginModal, user } = useAuth()
  const canvasViewportRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<{
    layerId: string
    startX: number
    startY: number
    startDocument: CanvasDocument
    scale: number
  } | null>(null)

  const { data: design, isLoading, isError, refetch } = useQuery({
    queryKey: ['designEditor', designId],
    queryFn: () => designApi.getById(designId),
    enabled: isLoggedIn && Number.isFinite(designId),
  })

  const [title, setTitle] = useState('未命名设计')
  const [document, setDocument] = useState<CanvasDocument>(() => emptyDocument())
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [past, setPast] = useState<CanvasDocument[]>([])
  const [future, setFuture] = useState<CanvasDocument[]>([])
  const [dirty, setDirty] = useState(false)
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error' | 'conflict'>('saved')
  const [revision, setRevision] = useState(1)
  const [saveConflict, setSaveConflict] = useState(false)
  const [remoteUpdateAvailable, setRemoteUpdateAvailable] = useState(false)
  const [remoteRevision, setRemoteRevision] = useState<number | null>(null)
  const remoteNoticeRevisionRef = useRef<number | null>(null)
  const [scale, setScale] = useState(1)
  const [imageUrl, setImageUrl] = useState('')
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('properties')
  const [collaborationTeam, setCollaborationTeam] = useState<TeamOverview | null>(null)
  const [presences, setPresences] = useState<TeamPresence[]>([])
  const [comments, setComments] = useState<TeamComment[]>([])
  const [versions, setVersions] = useState<TeamVersion[]>([])
  const [commentContent, setCommentContent] = useState('')
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null)
  const commentDraftRef = useRef('')
  const [versionNote, setVersionNote] = useState('')
  const [isCollaborationLoading, setIsCollaborationLoading] = useState(false)
  const [isCommentSaving, setIsCommentSaving] = useState(false)
  const [isVersionSaving, setIsVersionSaving] = useState(false)
  const [collaborationError, setCollaborationError] = useState('')
  const [collaborationNotice, setCollaborationNotice] = useState('')

  const selectedLayer = useMemo(
    () => document.layers.find((layer) => layer.id === selectedLayerId) || null,
    [document.layers, selectedLayerId],
  )

  const collaborationMembers = useMemo(() => {
    if (collaborationTeam?.members?.length) {
      return collaborationTeam.members.map((member) => {
        const presence = presences.find((item) => item.userId === member.userId)
        return {
          userId: member.userId,
          username: member.username,
          nickname: member.nickname,
          status: presence?.status || member.presence || 'offline',
          lastSeen: presence?.lastSeen || member.lastSeen,
        }
      })
    }
    return presences
  }, [collaborationTeam, presences])

  const onlineMemberCount = useMemo(
    () => collaborationMembers.filter((member) => member.status === 'online').length,
    [collaborationMembers],
  )

  useEffect(() => {
    if (!design) return
    setTitle(design.title || '未命名设计')
    setDocument(parseDocument(design))
    setRevision(design.revision || 1)
    setPast([])
    setFuture([])
    setDirty(false)
    setSaveState('saved')
    setSaveConflict(false)
    setRemoteUpdateAvailable(false)
    setRemoteRevision(null)
    remoteNoticeRevisionRef.current = null
    setPresences([])
    setComments([])
    setVersions([])
    setCommentContent('')
    setReplyToCommentId(null)
    commentDraftRef.current = ''
  }, [design])

  useEffect(() => {
    if (!isLoggedIn) setShowLoginModal(true)
  }, [isLoggedIn, setShowLoginModal])

  const loadCollaborationData = useCallback(async (teamId: number) => {
    const [nextPresences, nextComments, nextVersions] = await Promise.all([
      teamApi.getPresence(teamId),
      teamApi.getComments(teamId, designId),
      teamApi.getVersions(teamId, designId),
    ])
    setPresences(nextPresences)
    setComments(nextComments)
    setVersions(nextVersions)
  }, [designId])

  useEffect(() => {
    if (!isLoggedIn || !design || !Number.isFinite(designId)) return
    let disposed = false
    let currentTeamId: number | null = null

    const connectCollaboration = async () => {
      setIsCollaborationLoading(true)
      setCollaborationError('')
      try {
        const team = await teamApi.getCurrent()
        if (disposed) return
        currentTeamId = team.teamId
        setCollaborationTeam(team)
        await teamApi.updatePresence(team.teamId, 'online')
        await loadCollaborationData(team.teamId)
      } catch {
        if (!disposed) {
          setCollaborationError('当前设计暂未加入团队协作，普通编辑和保存不受影响。')
          setPresences([])
          setComments([])
          setVersions([])
        }
      } finally {
        if (!disposed) setIsCollaborationLoading(false)
      }
    }

    const heartbeat = () => {
      if (!currentTeamId) return
      void Promise.all([
        teamApi.updatePresence(currentTeamId, 'online'),
        teamApi.getPresence(currentTeamId),
      ]).then(([, nextPresences]) => {
        if (!disposed) setPresences(nextPresences)
      }).catch(() => undefined)
    }

    void connectCollaboration()
    const heartbeatId = window.setInterval(heartbeat, 60_000)
    return () => {
      disposed = true
      window.clearInterval(heartbeatId)
      if (currentTeamId) void teamApi.updatePresence(currentTeamId, 'away').catch(() => undefined)
    }
  }, [design, designId, isLoggedIn, loadCollaborationData])

  useEffect(() => {
    const viewport = canvasViewportRef.current
    if (!viewport) return
    const updateScale = () => {
      const availableWidth = Math.max(220, viewport.clientWidth - 48)
      const availableHeight = Math.max(220, viewport.clientHeight - 48)
      setScale(Math.min(1, availableWidth / document.width, availableHeight / document.height))
    }
    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [document.width, document.height])

  const saveDesign = useCallback(async () => {
    if (!designId || !dirty || saveConflict) return
    setSaveState('saving')
    try {
      const saved = await designApi.save(designId, {
        title: title.trim() || '未命名设计',
        canvasJson: JSON.stringify(document),
        revision: revision,
        width: document.width,
        height: document.height,
      })
      setRevision(saved.revision || revision + 1)
      setDirty(false)
      setSaveState('saved')
      setSaveConflict(false)
      setRemoteUpdateAvailable(false)
      setRemoteRevision(null)
      remoteNoticeRevisionRef.current = null
    } catch (error) {
      if (error instanceof ApiError && error.code === 409) {
        setSaveConflict(true)
        setSaveState('conflict')
        try {
          const latest = await designApi.getById(designId)
          setRevision(latest.revision || revision)
        } catch {
          // Keep the local draft when the latest server copy cannot be fetched.
        }
      } else {
        setSaveState('error')
      }
    }
  }, [designId, dirty, document, revision, saveConflict, title])

  useEffect(() => {
    if (!dirty || saveConflict) return
    const timer = window.setTimeout(() => void saveDesign(), 900)
    return () => window.clearTimeout(timer)
  }, [dirty, saveConflict, saveDesign])

  const reloadLatestDesign = useCallback(async () => {
    if (!designId) return
    setSaveState('saving')
    try {
      const latest = await designApi.getById(designId)
      setTitle(latest.title || '未命名设计')
      setDocument(parseDocument(latest))
      setRevision(latest.revision || 1)
      setPast([])
      setFuture([])
      setDirty(false)
      setSaveConflict(false)
      setRemoteUpdateAvailable(false)
      setRemoteRevision(null)
      remoteNoticeRevisionRef.current = null
      setSaveState('saved')
      setCollaborationNotice('已加载服务器最新版本。')
    } catch {
      setSaveState('conflict')
      setCollaborationNotice('最新版本加载失败，请稍后重试。')
    }
  }, [designId])

  const dismissRemoteUpdate = () => {
    setRemoteUpdateAvailable(false)
    setRemoteRevision(null)
  }

  useEffect(() => {
    if (!isLoggedIn || !designId || saveConflict) return
    let disposed = false
    let checking = false

    const checkForRemoteChanges = async () => {
      if (checking || window.document.visibilityState === 'hidden') return
      checking = true
      try {
        const latest = await designApi.getById(designId)
        const latestRevision = latest.revision || 1
        if (!disposed && latestRevision > revision && remoteNoticeRevisionRef.current !== latestRevision) {
          remoteNoticeRevisionRef.current = latestRevision
          setRemoteRevision(latestRevision)
          setRemoteUpdateAvailable(true)
        }
      } catch {
        // Remote update checks must never interrupt local editing.
      } finally {
        checking = false
      }
    }

    const pollingId = window.setInterval(checkForRemoteChanges, 15_000)
    return () => {
      disposed = true
      window.clearInterval(pollingId)
    }
  }, [designId, isLoggedIn, revision, saveConflict])

  const refreshCollaboration = useCallback(async () => {
    if (!collaborationTeam) return
    setIsCollaborationLoading(true)
    setCollaborationError('')
    setCollaborationNotice('')
    try {
      await teamApi.updatePresence(collaborationTeam.teamId, 'online')
      await loadCollaborationData(collaborationTeam.teamId)
    } catch {
      setCollaborationError('无法刷新协作信息，请确认该设计属于当前团队后重试。')
    } finally {
      setIsCollaborationLoading(false)
    }
  }, [collaborationTeam, loadCollaborationData])

  const commitDocument = useCallback((next: CanvasDocument) => {
    setPast((items) => [...items.slice(-39), cloneDocument(document)])
    setFuture([])
    setDocument(next)
    setDirty(true)
  }, [document])

  const updateLayer = useCallback((layerId: string, patch: Partial<EditorLayer>) => {
    commitDocument({
      ...document,
      layers: document.layers.map((layer) => layer.id === layerId ? { ...layer, ...patch } : layer),
    })
  }, [commitDocument, document])

  const deleteSelected = useCallback(() => {
    if (!selectedLayerId) return
    commitDocument({
      ...document,
      layers: document.layers.filter((layer) => layer.id !== selectedLayerId),
    })
    setSelectedLayerId(null)
  }, [commitDocument, document, selectedLayerId])

  const undo = useCallback(() => {
    const previous = past[past.length - 1]
    if (!previous) return
    setPast((items) => items.slice(0, -1))
    setFuture((items) => [cloneDocument(document), ...items])
    setDocument(previous)
    setDirty(true)
  }, [document, past])

  const redo = useCallback(() => {
    const next = future[0]
    if (!next) return
    setFuture((items) => items.slice(1))
    setPast((items) => [...items, cloneDocument(document)])
    setDocument(next)
    setDirty(true)
  }, [document, future])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        redo()
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const target = event.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') deleteSelected()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [deleteSelected, redo, undo])

  const addTextLayer = () => {
    const layer: EditorLayer = {
      id: createLayerId(), type: 'text', x: document.width / 2 - 140, y: document.height / 2 - 28,
      width: 280, height: 56, content: '双击编辑文字', fontSize: 32, fontWeight: 600, color: '#111827',
    }
    commitDocument({ ...document, layers: [...document.layers, layer] })
    setSelectedLayerId(layer.id)
  }

  const addImageLayer = (src: string) => {
    const layer: EditorLayer = {
      id: createLayerId(), type: 'image', x: document.width / 2 - 160, y: document.height / 2 - 120,
      width: 320, height: 240, src, opacity: 1,
    }
    commitDocument({ ...document, layers: [...document.layers, layer] })
    setSelectedLayerId(layer.id)
    setImageUrl('')
  }

  const uploadImage = async (file: File) => {
    setSaveState('saving')
    try {
      const uploaded = await aiApi.upload(file)
      addImageLayer(uploaded.url)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }

  const onLayerPointerDown = (event: React.PointerEvent<HTMLDivElement>, layer: EditorLayer) => {
    event.stopPropagation()
    setSelectedLayerId(layer.id)
    dragRef.current = {
      layerId: layer.id,
      startX: event.clientX,
      startY: event.clientY,
      startDocument: cloneDocument(document),
      scale,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onLayerPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.layerId !== selectedLayerId) return
    const baseLayer = drag.startDocument.layers.find((layer) => layer.id === drag.layerId)
    if (!baseLayer) return
    const dx = (event.clientX - drag.startX) / drag.scale
    const dy = (event.clientY - drag.startY) / drag.scale
    setDocument({
      ...drag.startDocument,
      layers: drag.startDocument.layers.map((layer) => layer.id === drag.layerId
        ? { ...layer, x: Math.max(0, Math.min(drag.startDocument.width - layer.width, baseLayer.x + dx)), y: Math.max(0, Math.min(drag.startDocument.height - layer.height, baseLayer.y + dy)) }
        : layer),
    })
    setDirty(true)
  }

  const onLayerPointerUp = () => {
    const drag = dragRef.current
    if (!drag) return
    setPast((items) => [...items.slice(-39), drag.startDocument])
    setFuture([])
    dragRef.current = null
  }

  const exportPng = async () => {
    try {
      await usageApi.consume('export')
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '今日导出额度已用完，请升级会员')
      return
    }
    const output = window.document.createElement('canvas')
    const multiplier = 2
    output.width = document.width * multiplier
    output.height = document.height * multiplier
    const context = output.getContext('2d')
    if (!context) return
    context.scale(multiplier, multiplier)
    context.fillStyle = document.background
    context.fillRect(0, 0, document.width, document.height)
    for (const layer of document.layers) {
      context.globalAlpha = layer.opacity ?? 1
      if (layer.type === 'text') {
        context.fillStyle = layer.color || '#111827'
        context.font = `${layer.fontWeight || 500} ${layer.fontSize || 28}px Arial, sans-serif`
        context.textBaseline = 'top'
        context.fillText(layer.content || '', layer.x, layer.y)
      } else if (layer.src) {
        await new Promise<void>((resolve) => {
          const image = new Image()
          image.crossOrigin = 'anonymous'
          image.onload = () => { context.drawImage(image, layer.x, layer.y, layer.width, layer.height); resolve() }
          image.onerror = () => resolve()
          image.src = layer.src || ''
        })
      }
    }
    context.globalAlpha = 1
    const anchor = window.document.createElement('a')
    anchor.download = `${title.trim() || '未命名设计'}.png`
    anchor.href = output.toDataURL('image/png')
    anchor.click()
  }

  const submitComment = async () => {
    const content = commentContent.trim()
    if (!content || !collaborationTeam) return
    const isReply = replyToCommentId !== null
    setIsCommentSaving(true)
    setCollaborationNotice('')
    try {
      await teamApi.addComment(collaborationTeam.teamId, designId, {
        content,
        parentId: replyToCommentId ?? undefined,
      })
      if (!isReply) commentDraftRef.current = ''
      setCommentContent(isReply ? commentDraftRef.current : '')
      setReplyToCommentId(null)
    } catch {
      setCollaborationNotice('评论发布失败，请确认当前设计已加入团队。')
      return
    }
    try {
      await loadCollaborationData(collaborationTeam.teamId)
    } catch {
      setCollaborationNotice('评论已发布，但协作信息刷新失败，请稍后手动刷新。')
    } finally {
      setIsCommentSaving(false)
    }
  }

  const deleteComment = async (commentId: number) => {
    if (!collaborationTeam) return
    setCollaborationNotice('')
    try {
      await teamApi.removeComment(collaborationTeam.teamId, commentId)
      await loadCollaborationData(collaborationTeam.teamId)
    } catch {
      setCollaborationNotice('无法删除这条评论。')
    }
  }

  const createVersion = async () => {
    if (!collaborationTeam) return
    setIsVersionSaving(true)
    setCollaborationNotice('')
    try {
      await teamApi.createVersion(collaborationTeam.teamId, designId, {
        canvasJson: JSON.stringify(document),
        note: versionNote.trim() || undefined,
      })
      setVersionNote('')
      await loadCollaborationData(collaborationTeam.teamId)
    } catch {
      setCollaborationNotice('版本快照创建失败，请确认当前设计已加入团队。')
    } finally {
      setIsVersionSaving(false)
    }
  }

  const loadVersion = (version: TeamVersion) => {
    if (!window.confirm(`确定载入版本 V${version.versionNo} 吗？当前未保存的改动会保留在撤销记录中。`)) return
    try {
      const parsed = JSON.parse(version.canvasJson) as Partial<CanvasDocument>
      commitDocument(mergeDocument(parsed, document))
      setSelectedLayerId(null)
      setSaveConflict(false)
      setCollaborationNotice(`已将版本 V${version.versionNo} 载入画布，正在自动保存。`)
    } catch {
      setCollaborationNotice('该历史版本的数据无效，无法载入。')
    }
  }

  const canDeleteComment = (comment: TeamComment) =>
    comment.userId === user?.id || collaborationTeam?.currentRole === 'owner' || collaborationTeam?.currentRole === 'admin'

  const replyTarget = useMemo(
    () => comments.find((comment) => comment.id === replyToCommentId) || null,
    [comments, replyToCommentId],
  )

  if (!isLoggedIn) {
    return <div className="design-editor-login"><p>登录后才能打开设计编辑器</p><LoginModal /></div>
  }
  if (isLoading) return <div className="design-editor-loading">正在打开设计...</div>
  if (isError || !design) return <div className="design-editor-loading"><p>设计不存在或已被删除</p><button type="button" onClick={() => void refetch()}>重新加载</button></div>

  return (
    <div className="design-editor-shell">
      <header className="design-editor-topbar">
        <button type="button" className="design-editor-icon-btn" onClick={() => navigate(-1)} aria-label="返回">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="design-editor-title-wrap">
          <input value={title} onChange={(event) => { setTitle(event.target.value); setDirty(true) }} aria-label="设计名称" />
          <span className={cn('design-editor-save-state', saveState === 'error' && 'is-error', saveState === 'conflict' && 'is-conflict')}>
            {saveState === 'saving' ? '保存中...' : saveState === 'error' ? '保存失败' : saveState === 'conflict' ? '版本冲突' : '已保存'}
          </span>
        </div>
        <div className="design-editor-top-actions">
            <button type="button" className="design-editor-action-btn" onClick={() => void saveDesign()} disabled={!dirty || saveState === 'saving' || saveConflict}>
            <Save className="h-4 w-4" /> 保存
          </button>
          <button type="button" className="design-editor-action-btn design-editor-action-btn--primary" onClick={() => void exportPng()}>
            <Download className="h-4 w-4" /> 导出 PNG
          </button>
        </div>
      </header>
      {saveConflict ? <div className="design-editor-conflict-banner" role="alert"><span>检测到其他成员已更新这个设计，本地改动暂未覆盖服务器。</span><div><button type="button" onClick={() => void reloadLatestDesign()}>重新加载最新版本</button><button type="button" onClick={() => setInspectorTab('collaboration')}>查看版本历史</button></div></div> : null}
      {remoteUpdateAvailable && !saveConflict ? <div className="design-editor-remote-update-banner" role="status"><span>其他成员已更新这个设计{remoteRevision ? `（V${remoteRevision}）` : ''}，当前画布未被替换。</span><div><button type="button" onClick={() => void reloadLatestDesign()}>加载最新版本</button><button type="button" onClick={dismissRemoteUpdate}>稍后处理</button></div></div> : null}
      <div className="design-editor-body">
        <aside className="design-editor-toolbar">
          <button type="button" onClick={addTextLayer}><Type className="h-5 w-5" /><span>文字</span></button>
          <button type="button" onClick={() => fileInputRef.current?.click()}><ImagePlus className="h-5 w-5" /><span>图片</span></button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); event.target.value = '' }} />
        </aside>
        <main className="design-editor-workspace">
          <div className="design-editor-workspace-head">
            <div className="design-editor-history">
              <button type="button" onClick={undo} disabled={!past.length} aria-label="撤销"><Undo2 className="h-4 w-4" /></button>
              <button type="button" onClick={redo} disabled={!future.length} aria-label="重做"><Redo2 className="h-4 w-4" /></button>
            </div>
            <span>{Math.round(scale * 100)}%</span>
          </div>
          <div ref={canvasViewportRef} className="design-editor-canvas-viewport">
            <div className="design-editor-canvas-frame" style={{ width: document.width * scale, height: document.height * scale }}>
              <div
                className="design-editor-canvas"
                style={{ width: document.width, height: document.height, background: document.background, transform: `scale(${scale})` }}
                onPointerDown={() => setSelectedLayerId(null)}
              >
                {document.layers.map((layer, index) => (
                  <div
                    key={layer.id}
                    className={cn('design-editor-layer', selectedLayerId === layer.id && 'is-selected')}
                    style={{ left: layer.x, top: layer.y, width: layer.width, height: layer.height, opacity: layer.opacity ?? 1, zIndex: index + 1 }}
                    onPointerDown={(event) => onLayerPointerDown(event, layer)}
                    onPointerMove={onLayerPointerMove}
                    onPointerUp={onLayerPointerUp}
                  >
                    {layer.type === 'text' ? <span style={{ color: layer.color || '#111827', fontSize: layer.fontSize || 28, fontWeight: layer.fontWeight || 500 }}>{layer.content}</span> : <img src={layer.src} alt="" draggable={false} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <aside className="design-editor-inspector">
          <div className="design-editor-inspector-tabs" role="tablist" aria-label="编辑器侧栏">
            <button type="button" className={cn(inspectorTab === 'properties' && 'is-active')} onClick={() => setInspectorTab('properties')} role="tab" aria-selected={inspectorTab === 'properties'}><span>属性</span></button>
            <button type="button" className={cn(inspectorTab === 'collaboration' && 'is-active')} onClick={() => setInspectorTab('collaboration')} role="tab" aria-selected={inspectorTab === 'collaboration'}><UsersRound className="h-3.5 w-3.5" /><span>协作</span>{onlineMemberCount > 0 ? <b>{onlineMemberCount}</b> : null}</button>
          </div>
          {inspectorTab === 'properties' ? (
            <>
              <div className="design-editor-inspector-head"><span>{selectedLayer ? '图层属性' : '画布属性'}</span>{selectedLayer ? <button type="button" onClick={deleteSelected} aria-label="删除图层"><Trash2 className="h-4 w-4" /></button> : null}</div>
              {selectedLayer ? (
                <div className="design-editor-inspector-content">
                  <p className="design-editor-inspector-label">{selectedLayer.type === 'text' ? '文字图层' : '图片图层'}</p>
                  {selectedLayer.type === 'text' ? (
                    <>
                      <label>文字<textarea value={selectedLayer.content || ''} onChange={(event) => updateLayer(selectedLayer.id, { content: event.target.value })} /></label>
                      <label>字号<input type="number" min="8" max="240" value={selectedLayer.fontSize || 28} onChange={(event) => updateLayer(selectedLayer.id, { fontSize: Number(event.target.value) || 28 })} /></label>
                      <label>颜色<input type="color" value={selectedLayer.color || '#111827'} onChange={(event) => updateLayer(selectedLayer.id, { color: event.target.value })} /></label>
                    </>
                  ) : (
                    <label>图片地址<input value={selectedLayer.src || ''} onChange={(event) => updateLayer(selectedLayer.id, { src: event.target.value })} /></label>
                  )}
                  <div className="design-editor-position-grid">
                    <label>X<input type="number" value={Math.round(selectedLayer.x)} onChange={(event) => updateLayer(selectedLayer.id, { x: Number(event.target.value) || 0 })} /></label>
                    <label>Y<input type="number" value={Math.round(selectedLayer.y)} onChange={(event) => updateLayer(selectedLayer.id, { y: Number(event.target.value) || 0 })} /></label>
                    <label>宽<input type="number" min="1" value={Math.round(selectedLayer.width)} onChange={(event) => updateLayer(selectedLayer.id, { width: Number(event.target.value) || 1 })} /></label>
                    <label>高<input type="number" min="1" value={Math.round(selectedLayer.height)} onChange={(event) => updateLayer(selectedLayer.id, { height: Number(event.target.value) || 1 })} /></label>
                  </div>
                </div>
              ) : (
                <div className="design-editor-inspector-content"><p className="design-editor-inspector-label">画布</p><label>背景色<input type="color" value={document.background} onChange={(event) => commitDocument({ ...document, background: event.target.value })} /></label><p className="design-editor-hint">从左侧添加文字或图片，然后拖动图层调整位置。</p><div className="design-editor-image-url"><input placeholder="粘贴图片地址" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} /><button type="button" onClick={() => imageUrl.trim() && addImageLayer(imageUrl.trim())}><Plus className="h-4 w-4" /></button></div><button type="button" className="design-editor-upload-btn" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" />上传图片</button></div>
              )}
            </>
          ) : (
            <div className="design-editor-collaboration-panel">
              <div className="design-editor-collaboration-head">
                <div><strong>{collaborationTeam?.name || '团队协作'}</strong><span>{onlineMemberCount} 人在线</span></div>
                <button type="button" className="design-editor-icon-btn design-editor-icon-btn--small" onClick={() => void refreshCollaboration()} disabled={isCollaborationLoading} aria-label="刷新协作信息"><RefreshCw className={cn('h-4 w-4', isCollaborationLoading && 'is-spinning')} /></button>
              </div>
              {isCollaborationLoading && !collaborationMembers.length && !comments.length && !versions.length ? <p className="design-editor-collaboration-muted">正在加载协作信息...</p> : null}
              {collaborationError ? <div className="design-editor-collaboration-alert">{collaborationError}</div> : null}
              {collaborationNotice ? <div className="design-editor-collaboration-notice">{collaborationNotice}</div> : null}

              <section className="design-editor-collaboration-section">
                <div className="design-editor-section-title"><span><UsersRound className="h-3.5 w-3.5" />在线成员</span><em>{collaborationMembers.length}</em></div>
                {collaborationMembers.length ? <div className="design-editor-member-list">{collaborationMembers.map((member) => <div key={member.userId} className="design-editor-member"><span className={cn('design-editor-presence-dot', member.status === 'online' && 'is-online', member.status === 'away' && 'is-away')} /><span className="design-editor-member-name">{memberName(member)}</span><span className="design-editor-member-status">{member.status === 'online' ? '在线' : member.status === 'away' ? '离开' : '离线'}</span></div>)}</div> : <p className="design-editor-collaboration-muted">暂无团队成员状态</p>}
              </section>

              <section className="design-editor-collaboration-section">
                <div className="design-editor-section-title"><span><MessageSquarePlus className="h-3.5 w-3.5" />评论</span><em>{comments.length}</em></div>
                 {replyTarget ? <div className="design-editor-reply-target"><span>正在回复 {memberName(replyTarget)}</span><p>{replyTarget.content}</p></div> : null}
                 <div className="design-editor-comment-compose"><textarea value={commentContent} maxLength={2000} onChange={(event) => { setCommentContent(event.target.value); if (!replyToCommentId) commentDraftRef.current = event.target.value }} placeholder={replyToCommentId ? '回复这条评论...' : '写下对这个设计的想法...'} /><div className="design-editor-comment-compose-actions">{replyToCommentId ? <button type="button" className="design-editor-comment-cancel" onClick={() => { setReplyToCommentId(null); setCommentContent(commentDraftRef.current) }}>取消回复</button> : null}<button type="button" onClick={() => void submitComment()} disabled={!commentContent.trim() || isCommentSaving}><MessageSquarePlus className="h-3.5 w-3.5" />{isCommentSaving ? '发布中' : replyToCommentId ? '回复' : '发布'}</button></div></div>
                 <div className="design-editor-comment-list">{comments.length ? comments.map((comment) => <article key={comment.id} className={cn('design-editor-comment', comment.parentId ? 'is-reply' : undefined)}><div className="design-editor-comment-meta"><strong>{memberName(comment)}</strong><time>{formatCollaborationTime(comment.createTime)}</time><button type="button" className="design-editor-comment-reply" onClick={() => { setReplyToCommentId(comment.id); setCommentContent('') }} aria-label={`回复${memberName(comment)}`}>回复</button>{canDeleteComment(comment) ? <button type="button" onClick={() => void deleteComment(comment.id)} aria-label="删除评论"><Trash2 className="h-3.5 w-3.5" /></button> : null}</div><p>{comment.content}</p></article>) : <p className="design-editor-collaboration-muted">还没有评论</p>}</div>
              </section>

              <section className="design-editor-collaboration-section">
                <div className="design-editor-section-title"><span><History className="h-3.5 w-3.5" />版本历史</span><em>{versions.length}</em></div>
                <div className="design-editor-version-compose"><input value={versionNote} maxLength={120} onChange={(event) => setVersionNote(event.target.value)} placeholder="快照备注（可选）" /><button type="button" onClick={() => void createVersion()} disabled={isVersionSaving}><History className="h-3.5 w-3.5" />{isVersionSaving ? '创建中' : '创建快照'}</button></div>
                <div className="design-editor-version-list">{versions.length ? versions.map((version) => <article key={version.id} className="design-editor-version"><div><strong>V{version.versionNo}</strong><span>{memberName(version)} · {formatCollaborationTime(version.createTime)}</span></div><p>{version.note || '设计版本快照'}</p><button type="button" onClick={() => loadVersion(version)}>载入到画布</button></article>) : <p className="design-editor-collaboration-muted">暂无历史版本</p>}</div>
              </section>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
