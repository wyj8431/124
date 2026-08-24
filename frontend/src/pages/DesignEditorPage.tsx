import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  ImagePlus,
  Plus,
  Redo2,
  Save,
  Trash2,
  Type,
  Undo2,
  Upload,
} from 'lucide-react'
import { designApi, aiApi, usageApi } from '@/api'
import { LoginModal } from '@/components/auth/LoginModal'
import { useAuth } from '@/context/AuthContext'
import type { UserDesign } from '@/types'
import { cn } from '@/utils'

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
    return {
      ...fallback,
      ...parsed,
      width: Number(parsed.width) || fallback.width,
      height: Number(parsed.height) || fallback.height,
      background: parsed.background || fallback.background,
      layers: Array.isArray(parsed.layers) ? parsed.layers : [],
    }
  } catch {
    return fallback
  }
}

function cloneDocument(document: CanvasDocument): CanvasDocument {
  return JSON.parse(JSON.stringify(document)) as CanvasDocument
}

function createLayerId() {
  return `layer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function DesignEditorPage() {
  const { id: idParam } = useParams()
  const navigate = useNavigate()
  const designId = Number(idParam)
  const { isLoggedIn, setShowLoginModal } = useAuth()
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
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved')
  const [scale, setScale] = useState(1)
  const [imageUrl, setImageUrl] = useState('')

  const selectedLayer = useMemo(
    () => document.layers.find((layer) => layer.id === selectedLayerId) || null,
    [document.layers, selectedLayerId],
  )

  useEffect(() => {
    if (!design) return
    setTitle(design.title || '未命名设计')
    setDocument(parseDocument(design))
    setPast([])
    setFuture([])
    setDirty(false)
    setSaveState('saved')
  }, [design])

  useEffect(() => {
    if (!isLoggedIn) setShowLoginModal(true)
  }, [isLoggedIn, setShowLoginModal])

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
    if (!designId || !dirty) return
    setSaveState('saving')
    try {
      await designApi.save(designId, {
        title: title.trim() || '未命名设计',
        canvasJson: JSON.stringify(document),
        width: document.width,
        height: document.height,
      })
      setDirty(false)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }, [designId, dirty, document, title])

  useEffect(() => {
    if (!dirty) return
    const timer = window.setTimeout(() => void saveDesign(), 900)
    return () => window.clearTimeout(timer)
  }, [dirty, saveDesign])

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
          <span className={cn('design-editor-save-state', saveState === 'error' && 'is-error')}>
            {saveState === 'saving' ? '保存中...' : saveState === 'error' ? '保存失败' : '已保存'}
          </span>
        </div>
        <div className="design-editor-top-actions">
          <button type="button" className="design-editor-action-btn" onClick={() => void saveDesign()} disabled={!dirty || saveState === 'saving'}>
            <Save className="h-4 w-4" /> 保存
          </button>
          <button type="button" className="design-editor-action-btn design-editor-action-btn--primary" onClick={() => void exportPng()}>
            <Download className="h-4 w-4" /> 导出 PNG
          </button>
        </div>
      </header>
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
          <div className="design-editor-inspector-head"><span>属性</span>{selectedLayer ? <button type="button" onClick={deleteSelected} aria-label="删除图层"><Trash2 className="h-4 w-4" /></button> : null}</div>
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
        </aside>
      </div>
    </div>
  )
}
