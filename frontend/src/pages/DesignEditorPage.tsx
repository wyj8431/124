import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Bot,
  Boxes,
  CircleHelp,
  ChevronDown,
  Cloud,
  Download,
  FileText,
  Headphones,
  History,
  House,
  ImagePlus,
  Layers3,
  Maximize2,
  MoreVertical,
  Music2,
  Navigation,
  Palette,
  PanelTop,
  PanelRight,
  Paintbrush,
  PenTool,
  Play,
  Plus,
  Printer,
  Ruler,
  Search,
  Shapes,
  Sparkles,
  Type,
  Undo2,
  Upload,
  UsersRound,
  ZoomIn,
  ZoomOut,
  X,
  MousePointer2,
  Component,
  MessageSquarePlus,
  Share2,
  Redo2,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react'
import { ApiError, designApi, designShareApi, aiApi, teamApi, usageApi } from '@/api'
import { LoginModal } from '@/components/auth/LoginModal'
import { OfficialCatalogPanel } from '@/components/editor/OfficialCatalogPanel'
import { EditorAddPanel } from '@/components/editor/EditorAddPanel'
import { ImageResourcePanel, type ImageResourceGroup } from '@/components/editor/ImageResourcePanel'
import { ImageEditPanel } from '@/components/editor/ImageEditPanel'
import { OfficialResourcePanel } from '@/components/editor/OfficialResourcePanel'
import { TextResourcePanel, type LicensedFont, type TextResourceGroup } from '@/components/editor/TextResourcePanel'
import { VipMembershipMenu } from '@/components/layout/VipMembershipMenu'
import { useAuth } from '@/context/AuthContext'
import type { UserDesign } from '@/types'
import type { TeamComment, TeamOverview, TeamPresence, TeamVersion } from '@/types/team'
import { cn } from '@/utils'
import { collaborationColor, createCollaborationBridge, type CollaborationActor, type CollaborationBridge, type CollaborationCursor } from '@/modules/collaboration/collaborationBridge'
import { filterOfficialCatalog, filterOfficialResources, loadOfficialCatalog, type OfficialResource, type OfficialScene, type OfficialTemplate } from '@/modules/editor/officialCatalog.mjs'
import { type ShapeKind } from '@/modules/editor/addPanelCatalog.mjs'
import { createImageEditState, imageEditCssFilter, setLayerAsBackground, type ImageEditState } from '@/modules/editor/imageEditState.mjs'
import type { RemoteCursor } from '@/modules/collaboration/CollaborationCanvasSignals'
import { clampExportOptions, renderDocumentToDataUrl } from '@/utils/exportCanvasDocument'
import '@/styles/collaboration-comments.css'

const CollaborationCanvasSignals = lazy(() => import('@/modules/collaboration/CollaborationCanvasSignals'))

type LayerType = 'text' | 'image' | 'shape' | 'brush'

interface BrushPoint {
  x: number
  y: number
}

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
  fontFamily?: string
  color?: string
  opacity?: number
  rotation?: number
  imageEdit?: Partial<ImageEditState>
  shape?: ShapeKind
  points?: BrushPoint[]
  brushWidth?: number
}

interface CanvasDocument {
  version: string
  width: number
  height: number
  background: string
  brandColors?: string[]
  layers: EditorLayer[]
}

type InspectorTab = 'properties' | 'collaboration'

type AssetTab = 'assets' | 'images' | 'videos' | 'audio'

interface EditorAsset {
  id: string
  label: string
  type: AssetTab
  src: string
  tags: string[]
}

const EDITOR_ASSETS: EditorAsset[] = [
  { id: 'asset-poster', label: '海报参考', type: 'assets', src: '/home-features/hot-poster.webp', tags: ['海报', '营销'] },
  { id: 'asset-design', label: '设计参考', type: 'assets', src: '/home-features/image-design.webp', tags: ['设计', '创意'] },
  { id: 'asset-template-1', label: '模板参考一', type: 'assets', src: '/create-design/reference/template-01.jpg', tags: ['模板', '推荐'] },
  { id: 'asset-template-2', label: '模板参考二', type: 'assets', src: '/create-design/reference/template-02.jpg', tags: ['模板', '推荐'] },
  { id: 'asset-mobile', label: '手机海报', type: 'images', src: '/create-design/reference/preset-mobile.jpg', tags: ['图片', '手机'] },
  { id: 'asset-long', label: '长图海报', type: 'images', src: '/create-design/reference/preset-long.jpg', tags: ['图片', '长图'] },
  { id: 'asset-scene', label: '场景素材', type: 'images', src: '/create-design/official/scenes/1-625.png', tags: ['素材', '场景'] },
  { id: 'asset-template-official', label: '官方模板', type: 'images', src: '/create-design/official/templates/1-572139.png', tags: ['素材', '模板'] },
  { id: 'asset-video-placeholder', label: '视频素材', type: 'videos', src: '/home-features/hot-video.webp', tags: ['视频', '动态'] },
  { id: 'asset-audio-placeholder', label: '音频封面', type: 'audio', src: '/home-features/video-image.webp', tags: ['音频', '配乐'] },
  { id: 'asset-ai-pizza', label: 'AI美食', type: 'assets', src: '/home-features/hot-poster.webp', tags: ['AIGC', '插图'] },
  { id: 'asset-ai-character', label: 'AI人物', type: 'assets', src: '/home-features/image-design.webp', tags: ['AIGC', '人物'] },
  { id: 'asset-shape-circle', label: '圆形渐变', type: 'assets', src: '/create-design/official/scenes/1-625.png', tags: ['形状', '渐变'] },
  { id: 'asset-line-doodle', label: '手绘线条', type: 'assets', src: '/create-design/reference/template-01.jpg', tags: ['线条', '手绘'] },
  { id: 'asset-frame-paper', label: '纸张边框', type: 'assets', src: '/create-design/reference/template-02.jpg', tags: ['边框', '纹理'] },
  { id: 'asset-icon-spark', label: '闪光图标', type: 'assets', src: '/home-features/video-image.webp', tags: ['图标', '装饰'] },
  { id: 'asset-container-note', label: '便签容器', type: 'assets', src: '/create-design/reference/preset-mobile.jpg', tags: ['容器', '便签'] },
  { id: 'asset-sticker-bow', label: '蝴蝶结贴纸', type: 'assets', src: '/create-design/reference/preset-long.jpg', tags: ['插图', '贴纸'] },
]

const DEFAULT_WIDTH = 800
const DEFAULT_HEIGHT = 600
const DEFAULT_BRAND_COLORS = ['#0773fc', '#111827', '#ffffff', '#f8fafc', '#ff6b35', '#16a34a']
const CANVAS_SIZE_MIN = 200
const CANVAS_SIZE_MAX = 8000
const EDITOR_SIDEBAR_SIZE_STORAGE_KEY = 'chuangkit.editor.sidebar-size'
const EDITOR_SIDEBAR_MIN_WIDTH = 240
const EDITOR_SIDEBAR_MIN_HEIGHT = 240

const LICENSED_FONTS: LicensedFont[] = [
  { id: 'source-han-sans', family: 'Source Han Sans SC', displayName: '思源黑体', category: '正文黑体' },
  { id: 'source-han-serif', family: 'Source Han Serif SC', displayName: '思源宋体', category: '正文宋体' },
  { id: 'zcool-kuaile', family: 'ZCOOL KuaiLe', displayName: '站酷快乐体', category: '活泼标题' },
  { id: 'zcool-xiaowei', family: 'ZCOOL XiaoWei', displayName: '站酷小薇', category: '优雅标题' },
  { id: 'ma-shan-zheng', family: 'Ma Shan Zheng', displayName: '马善政毛笔楷书', category: '毛笔书法' },
  { id: 'long-cang', family: 'Long Cang', displayName: '有字库龙藏体', category: '手写书法' },
  { id: 'lxgw-wenkai', family: 'LXGW WenKai', displayName: '霞鹜文楷', category: '阅读楷体' },
  { id: 'smiley-sans', family: 'Smiley Sans Oblique', displayName: '得意黑', category: '展示标题' },
  { id: 'zhimangxing', family: 'Zhi Mang Xing', displayName: '知莽行书', category: '行书毛笔' },
  { id: 'liujianmaocao', family: 'Liu Jian Mao Cao', displayName: '刘建毛草', category: '草书毛笔' },
  { id: 'zcool-qingke-huangyou', family: 'ZCOOL QingKe HuangYou', displayName: '站酷庆科黄油体', category: '卡通标题' },
  { id: 'dotgothic16', family: 'DotGothic16', displayName: 'DotGothic16', category: '日文像素', sampleText: 'DESIGN' },
  { id: 'dela-gothic-one', family: 'Dela Gothic One', displayName: 'Dela Gothic One', category: '日文重黑', sampleText: 'DESIGN' },
  { id: 'rampart-one', family: 'Rampart One', displayName: 'Rampart One', category: '日文装饰', sampleText: 'DESIGN' },
  { id: 'reggae-one', family: 'Reggae One', displayName: 'Reggae One', category: '日文手写', sampleText: 'DESIGN' },
  { id: 'rocknroll-one', family: 'RocknRoll One', displayName: 'RocknRoll One', category: '日文摇滚', sampleText: 'DESIGN' },
  { id: 'zen-kurenaido', family: 'Zen Kurenaido', displayName: 'Zen Kurenaido', category: '日文手写', sampleText: 'DESIGN' },
  { id: 'kaisei-decol', family: 'Kaisei Decol', displayName: 'Kaisei Decol', category: '日文装饰', sampleText: 'DESIGN' },
  { id: 'bungee-shade', family: 'Bungee Shade', displayName: 'Bungee Shade', category: '英文艺术字', sampleText: 'ART TEXT' },
  { id: 'fascinate', family: 'Fascinate', displayName: 'Fascinate', category: '英文艺术字', sampleText: 'ART TEXT' },
  { id: 'rubik-glitch', family: 'Rubik Glitch', displayName: 'Rubik Glitch', category: '英文故障', sampleText: 'ART TEXT' },
  { id: 'monoton', family: 'Monoton', displayName: 'Monoton', category: '英文霓虹', sampleText: 'ART TEXT' },
  { id: 'black-ops-one', family: 'Black Ops One', displayName: 'Black Ops One', category: '英文机能', sampleText: 'ART TEXT' },
  { id: 'righteous', family: 'Righteous', displayName: 'Righteous', category: '英文复古', sampleText: 'ART TEXT' },
]

type SidebarSize = {
  width?: number
  height?: number
}

const clampCanvasSize = (value: number) => Math.max(CANVAS_SIZE_MIN, Math.min(CANVAS_SIZE_MAX, Math.round(value)))

function readSidebarSize(): SidebarSize {
  if (typeof window === 'undefined') return {}
  try {
    const serialized = window.localStorage.getItem(EDITOR_SIDEBAR_SIZE_STORAGE_KEY)
    if (!serialized) return {}
    const parsed = JSON.parse(serialized) as SidebarSize
    return {
      width: Number.isFinite(parsed.width) ? Math.max(EDITOR_SIDEBAR_MIN_WIDTH, Math.round(parsed.width as number)) : undefined,
      height: Number.isFinite(parsed.height) ? Math.max(EDITOR_SIDEBAR_MIN_HEIGHT, Math.round(parsed.height as number)) : undefined,
    }
  } catch {
    return {}
  }
}

function saveSidebarSize(size: SidebarSize) {
  try {
    window.localStorage.setItem(EDITOR_SIDEBAR_SIZE_STORAGE_KEY, JSON.stringify(size))
  } catch {
    // Sidebar dimensions are a non-essential local preference.
  }
}

function emptyDocument(width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT): CanvasDocument {
  return {
    version: '1.0',
    width,
    height,
    background: '#ffffff',
    brandColors: [...DEFAULT_BRAND_COLORS],
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
    brandColors: Array.isArray(parsed.brandColors) ? parsed.brandColors : fallback.brandColors,
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

function BrushStroke({ width, height, points, color, brushWidth, opacity, className }: {
  width: number
  height: number
  points: BrushPoint[]
  color: string
  brushWidth: number
  opacity: number
  className: string
}) {
  if (!points.length) return null
  return (
    <svg className={className} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke={color} strokeWidth={brushWidth} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
    </svg>
  )
}

function ImageLayerPreview({ layer }: { layer: EditorLayer }) {
  const edit = createImageEditState(layer.imageEdit)
  const { crop } = edit
  return (
    <span
      className="design-editor-image-frame"
      style={{
        borderRadius: edit.cornerRadius,
        border: edit.borderWidth ? `${edit.borderWidth}px solid ${edit.borderColor}` : undefined,
        boxShadow: edit.shadowEnabled ? '0 10px 24px rgba(15, 23, 42, .26)' : undefined,
      }}
    >
      <img
        src={layer.src}
        alt=""
        draggable={false}
        style={{
          width: `${100 / crop.width}%`,
          height: `${100 / crop.height}%`,
          maxWidth: 'none',
          left: `${-(crop.x / crop.width) * 100}%`,
          top: `${-(crop.y / crop.height) * 100}%`,
          filter: imageEditCssFilter(edit),
          transform: `scaleX(${edit.flipX ? -1 : 1}) scaleY(${edit.flipY ? -1 : 1})`,
        }}
      />
    </span>
  )
}

export function DesignEditorPage() {
  const { id: idParam } = useParams()
  const navigate = useNavigate()
  const designId = Number(idParam)
  const { isLoggedIn, setShowLoginModal, user, login } = useAuth()
  const isDevPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === '1'
  const shareToken = new URLSearchParams(window.location.search).get('shareToken')
  const shareModeParam = new URLSearchParams(window.location.search).get('mode')
  const canvasViewportRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sidebarResizeRef = useRef<{
    pointerId: number
    axis: 'right' | 'bottom' | 'corner'
    startX: number
    startY: number
    startSize: Required<SidebarSize>
    nextSize: SidebarSize
  } | null>(null)
  const canvasResizeRef = useRef<{
    pointerId: number
    axis: 'right' | 'bottom' | 'corner'
    startX: number
    startY: number
    startDocument: CanvasDocument
    currentDocument: CanvasDocument
    scale: number
  } | null>(null)
  const dragRef = useRef<{
    layerId: string
    startX: number
    startY: number
    startDocument: CanvasDocument
    scale: number
  } | null>(null)
  const resizeRef = useRef<{
    layerId: string
    corner: 'nw' | 'ne' | 'sw' | 'se'
    startX: number
    startY: number
    startDocument: CanvasDocument
    scale: number
  } | null>(null)
  const brushStrokeRef = useRef<{ pointerId: number; points: BrushPoint[] } | null>(null)

  const { data: design, isLoading, isError, refetch } = useQuery({
    queryKey: ['designEditor', designId, shareToken],
    queryFn: async () => {
      if (shareToken) {
        const shared = await designShareApi.resolve(shareToken)
        return { ...shared, id: shared.designId }
      }
      return designApi.getById(designId)
    },
    enabled: (isLoggedIn || Boolean(shareToken)) && Number.isFinite(designId),
  })

  const { data: officialCatalog, isError: officialCatalogError } = useQuery({
    queryKey: ['officialEditorCatalog'],
    queryFn: () => loadOfficialCatalog(),
    staleTime: Number.POSITIVE_INFINITY,
  })

  const shareAccessMode = (design as (typeof design & { mode?: string }) | undefined)?.mode
  const isReadOnlyShare = shareModeParam === 'readonly' || shareAccessMode === 'readonly' || (Boolean(shareToken) && !isLoggedIn)

  const [title, setTitle] = useState('未命名设计')
  const [document, setDocument] = useState<CanvasDocument>(() => emptyDocument())
  const [canvasWidthInput, setCanvasWidthInput] = useState(String(DEFAULT_WIDTH))
  const [canvasHeightInput, setCanvasHeightInput] = useState(String(DEFAULT_HEIGHT))
  const [sidebarSize, setSidebarSize] = useState<SidebarSize>(() => readSidebarSize())
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
  const [zoomMode, setZoomMode] = useState<'fit' | 'manual'>('fit')
  const [imageUrl, setImageUrl] = useState('')
  const [brandColorInput, setBrandColorInput] = useState('#0773fc')
  const [brushEnabled, setBrushEnabled] = useState(false)
  const [brushColor, setBrushColor] = useState('#111827')
  const [brushWidth, setBrushWidth] = useState(8)
  const [brushOpacity, setBrushOpacity] = useState(1)
  const [brushPreviewPoints, setBrushPreviewPoints] = useState<BrushPoint[]>([])
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('properties')
  const [toolPanelOpen, setToolPanelOpen] = useState(true)
  const [activeTool, setActiveTool] = useState<'add' | 'my' | 'templates' | 'assets' | 'text' | 'image' | 'background' | 'brand' | 'components' | 'ai' | 'brush' | 'team'>('add')
  const [assetTab, setAssetTab] = useState<AssetTab>('assets')
  const [assetQuery, setAssetQuery] = useState('')
  const [assetTag, setAssetTag] = useState('全部')
  const [officialCategoryId, setOfficialCategoryId] = useState<number | null>(null)
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const imagePickerModeRef = useRef<'add' | 'replace'>('add')
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false)
  const [showGuides, setShowGuides] = useState(false)
  const [showNavigator, setShowNavigator] = useState(false)
  const [fileMenuOpen, setFileMenuOpen] = useState(false)
  const [shareNotice, setShareNotice] = useState('')
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
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const [shareMode] = useState<'editable' | 'readonly'>('editable')
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png')
  const [exportScale, setExportScale] = useState(2)
  const [exportQuality, setExportQuality] = useState(0.92)
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([])
  const [layerLocks, setLayerLocks] = useState<Map<string, CollaborationActor>>(() => new Map())
  const collaborationBridgeRef = useRef<CollaborationBridge | null>(null)
  const collaborationActorRef = useRef<CollaborationActor | null>(null)
  const latestDocumentRef = useRef(document)
  const latestTitleRef = useRef(title)
  const latestRevisionRef = useRef(revision)
  const latestDirtyRef = useRef(dirty)
  const cursorSentAtRef = useRef(0)

  const editorBodyStyle = (sidebarSize.width || sidebarSize.height ? {
    '--editor-sidebar-width': sidebarSize.width ? `${sidebarSize.width}px` : undefined,
    '--editor-sidebar-height': sidebarSize.height ? `${sidebarSize.height}px` : undefined,
  } : undefined) as CSSProperties | undefined

  useEffect(() => {
    setCanvasWidthInput(String(document.width))
    setCanvasHeightInput(String(document.height))
  }, [document.height, document.width])

  const assetTags = ['全部', '形状', '线条', '插图', '容器', '边框', '图标', 'AIGC', '动图']
  const visibleAssets = useMemo(() => {
    const query = assetQuery.trim().toLowerCase()
    return EDITOR_ASSETS.filter((asset) => {
      const matchesTab = assetTab === 'assets' ? asset.type !== 'audio' : asset.type === assetTab
      const matchesTag = assetTag === '全部' || asset.tags.includes(assetTag)
      const matchesQuery = !query || `${asset.label} ${asset.tags.join(' ')}`.toLowerCase().includes(query)
      return matchesTab && matchesTag && matchesQuery
    })
  }, [assetQuery, assetTab, assetTag])

  const officialSelection = useMemo(
    () => officialCatalog ? filterOfficialCatalog(officialCatalog, { categoryId: officialCategoryId, query: assetQuery }) : null,
    [assetQuery, officialCatalog, officialCategoryId],
  )

  const officialAssetResources = useMemo(
    () => filterOfficialResources(officialCatalog, { kind: 'asset', query: assetQuery }),
    [assetQuery, officialCatalog],
  )

  const officialImageResources = useMemo(
    () => [
      ...filterOfficialResources(officialCatalog, { kind: 'asset' }).filter((resource) => resource.sceneId !== 459),
      ...filterOfficialResources(officialCatalog, { kind: 'background' }),
    ],
    [officialCatalog],
  )

  const officialArtTextResources = useMemo(
    () => filterOfficialResources(officialCatalog, { kind: 'asset', sceneId: 459 }),
    [officialCatalog],
  )

  const textResourceGroups = useMemo<TextResourceGroup[]>(() => {
    const assignedIds = new Set<number>()
    const createGroup = (id: string, title: string, keywords: string[]): TextResourceGroup => {
      const resources = officialArtTextResources.filter((resource) =>
        !assignedIds.has(resource.id) && keywords.some((keyword) => resource.title.includes(keyword)),
      )
      resources.forEach((resource) => assignedIds.add(resource.id))
      return { id, title, resources }
    }
    const groups = [
      createGroup('transform', '变形标题', ['变形', '像素', '小红书']),
      createGroup('effect', '特效文字', ['手写', '组合字', '拼贴', '卡通']),
      createGroup('festival', '节日热点', ['情人节', '年会', '年货节', '新年', '元旦']),
      createGroup('chinese-style', '国风主题', ['中国风', '国潮', '印章']),
    ].filter((group) => group.resources.length > 0)
    const remaining = officialArtTextResources.filter((resource) => !assignedIds.has(resource.id))

    return remaining.length ? [...groups, { id: 'popular', title: '热门文字', resources: remaining }] : groups
  }, [officialArtTextResources])

  const imageResourceGroups = useMemo<ImageResourceGroup[]>(() => {
    const assignedIds = new Set<number>()
    const createGroup = (id: string, title: string, tag: string, keywords: string[]): ImageResourceGroup => {
      const resources = officialImageResources.filter((resource) =>
        !assignedIds.has(resource.id) && keywords.some((keyword) => resource.title.includes(keyword)),
      )
      resources.forEach((resource) => assignedIds.add(resource.id))
      return { id, title, tag, resources }
    }
    const groups = [
      createGroup('spring', '春日灵感', '春天', ['春', '花', '叶', '树', '草', '蓝天', '露营']),
      createGroup('technology', '科技创意', '科技', ['科技', '航空', '互联网', '商务', '立体']),
      createGroup('education', '教育阅读', '教育', ['教育', '读书', '知识', '学校', '书本']),
      createGroup('food', '美食旅行', '美食', ['美食', '餐饮', '月饼', '食物']),
      createGroup('background', '图片背景', '背景', ['背景', '渐变', '油画', '水彩', '纹理']),
      createGroup('travel', '旅行插画', '旅行', ['旅游', '地标', '风景', '山', '海']),
    ].filter((group) => group.resources.length > 0)
    const remaining = officialImageResources.filter((resource) => !assignedIds.has(resource.id))

    return remaining.length ? [...groups, { id: 'featured', title: '插画精选', tag: '旅行', resources: remaining }] : groups
  }, [officialImageResources])

  const officialBackgroundResources = useMemo(
    () => filterOfficialResources(officialCatalog, { kind: 'background' }),
    [officialCatalog],
  )

  const officialComponentResources = useMemo(
    () => filterOfficialResources(officialCatalog, { kind: 'component' }),
    [officialCatalog],
  )

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
    latestDocumentRef.current = document
    latestTitleRef.current = title
    latestRevisionRef.current = revision
    latestDirtyRef.current = dirty
  }, [document, dirty, revision, title])

  useEffect(() => {
    if (!design || !Number.isFinite(designId)) return
    const actor: CollaborationActor = {
      id: String(user?.id || `preview-${designId}`),
      name: user?.nickname || user?.username || '当前用户',
      color: collaborationColor(user?.id || designId),
    }
    collaborationActorRef.current = actor
    const bridge = createCollaborationBridge(designId, actor)
    collaborationBridgeRef.current = bridge
    const unsubscribe = bridge.subscribe((event) => {
      if (event.type === 'cursor') {
        const payload = event.payload as Partial<CollaborationCursor>
        if (!Number.isFinite(payload.x) || !Number.isFinite(payload.y)) return
        setRemoteCursors((items) => [...items.filter((item) => item.id !== event.actor.id), { ...event.actor, x: payload.x as number, y: payload.y as number, updatedAt: event.sentAt }].slice(-8))
      } else if (event.type === 'document-update') {
        const payload = event.payload as { document?: CanvasDocument }
        if (!payload.document) return
        if (latestDirtyRef.current) {
          setCollaborationNotice(`${event.actor.name} 正在编辑，当前本地改动未被替换。`)
          return
        }
        setDocument(mergeDocument(payload.document, latestDocumentRef.current))
        setRevision((value) => Math.max(value, latestRevisionRef.current))
        setCollaborationNotice(`已同步 ${event.actor.name} 的最新编辑。`)
      } else if (event.type === 'layer-lock') {
        const payload = event.payload as { layerId?: string }
        if (payload.layerId) setLayerLocks((locks) => new Map(locks).set(payload.layerId as string, event.actor))
      } else if (event.type === 'layer-unlock') {
        const payload = event.payload as { layerId?: string }
        if (payload.layerId) setLayerLocks((locks) => { const next = new Map(locks); if (next.get(payload.layerId as string)?.id === event.actor.id) next.delete(payload.layerId as string); return next })
      }
    })
    return () => {
      unsubscribe()
      bridge.close()
      collaborationBridgeRef.current = null
      collaborationActorRef.current = null
      setRemoteCursors([])
      setLayerLocks(new Map())
    }
  }, [design, designId, user?.id, user?.nickname, user?.username])

  useEffect(() => {
    if (isLoggedIn || shareToken || !isDevPreview) return
    void login('demo', '123456').catch(() => setShowLoginModal(true))
  }, [isDevPreview, isLoggedIn, login, setShowLoginModal, shareToken])

  useEffect(() => {
    if (!isLoggedIn && !isDevPreview && !shareToken) setShowLoginModal(true)
  }, [isDevPreview, isLoggedIn, setShowLoginModal, shareToken])

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
      if (zoomMode === 'fit' && !canvasResizeRef.current) {
        setScale(Math.min(1, availableWidth / document.width, availableHeight / document.height))
      }
    }
    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [document.width, document.height, zoomMode])

  const saveDesign = useCallback(async () => {
    if (!designId || isReadOnlyShare || !dirty || saveConflict) return
    setSaveState('saving')
    try {
      const saved = await designApi.save(designId, {
        title: title.trim() || '未命名设计',
        canvasJson: JSON.stringify(document),
        revision: revision,
        width: document.width,
        height: document.height,
        shareToken: shareToken || undefined,
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
          const latest = shareToken ? await designShareApi.resolve(shareToken) : await designApi.getById(designId)
          setRevision(latest.revision || revision)
        } catch {
          // Keep the local draft when the latest server copy cannot be fetched.
        }
      } else {
        setSaveState('error')
      }
    }
  }, [designId, dirty, document, isReadOnlyShare, revision, saveConflict, shareToken, title])

  useEffect(() => {
    if (isReadOnlyShare || !dirty || saveConflict) return
    const timer = window.setTimeout(() => void saveDesign(), 900)
    return () => window.clearTimeout(timer)
  }, [dirty, isReadOnlyShare, saveConflict, saveDesign])

  useEffect(() => {
    if (isReadOnlyShare || !dirty || saveConflict) return
    const timer = window.setInterval(() => void saveDesign(), 30_000)
    return () => window.clearInterval(timer)
  }, [dirty, isReadOnlyShare, saveConflict, saveDesign])

  useEffect(() => {
    if (!designId || isReadOnlyShare) return
    const persistOnExit = () => {
      if (!latestDirtyRef.current || !localStorage.getItem('ckt_token')) return
      const token = localStorage.getItem('ckt_token')
      const saveUrl = new URL(`/admin/designs/${designId}`, window.location.origin)
      if (shareToken) saveUrl.searchParams.set('shareToken', shareToken)
      void fetch(saveUrl.toString(), {
        method: 'PUT',
        keepalive: true,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: latestTitleRef.current.trim() || '未命名设计', canvasJson: JSON.stringify(latestDocumentRef.current), revision: latestRevisionRef.current, width: latestDocumentRef.current.width, height: latestDocumentRef.current.height }),
      }).catch(() => undefined)
    }
    window.addEventListener('beforeunload', persistOnExit)
    return () => window.removeEventListener('beforeunload', persistOnExit)
  }, [designId, isReadOnlyShare, shareToken])

  const reloadLatestDesign = useCallback(async () => {
    if (!designId) return
    setSaveState('saving')
    try {
      const latest = shareToken ? await designShareApi.resolve(shareToken) : await designApi.getById(designId)
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
  }, [designId, shareToken])

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
        const latest = shareToken ? await designShareApi.resolve(shareToken) : await designApi.getById(designId)
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
  }, [designId, isLoggedIn, revision, saveConflict, shareToken])

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
    if (isReadOnlyShare) {
      setShareNotice('当前链接为只读权限，无法修改设计')
      window.setTimeout(() => setShareNotice(''), 2400)
      return
    }
    setPast((items) => [...items.slice(-39), cloneDocument(document)])
    setFuture([])
    setDocument(next)
    setDirty(true)
    collaborationBridgeRef.current?.publish('document-update', { document: cloneDocument(next) })
  }, [document, isReadOnlyShare])

  const resizeCanvas = useCallback((patch: Partial<Pick<CanvasDocument, 'width' | 'height'>>) => {
    const next = {
      ...document,
      width: clampCanvasSize(patch.width ?? document.width),
      height: clampCanvasSize(patch.height ?? document.height),
    }
    if (next.width === document.width && next.height === document.height) return
    commitDocument(next)
  }, [commitDocument, document])

  const updateLayer = useCallback((layerId: string, patch: Partial<EditorLayer>) => {
    commitDocument({
      ...document,
      layers: document.layers.map((layer) => layer.id === layerId ? { ...layer, ...patch } : layer),
    })
  }, [commitDocument, document])

  const moveLayer = useCallback((layerId: string, direction: 'up' | 'down' | 'front' | 'back') => {
    const index = document.layers.findIndex((layer) => layer.id === layerId)
    if (index < 0) return
    const layers = [...document.layers]
    const [layer] = layers.splice(index, 1)
    const targetIndex = direction === 'front'
      ? layers.length
      : direction === 'back'
        ? 0
        : Math.max(0, Math.min(layers.length, index + (direction === 'up' ? 1 : -1)))
    layers.splice(targetIndex, 0, layer)
    commitDocument({ ...document, layers })
  }, [commitDocument, document])

  const setSelectedImageAsBackground = useCallback(() => {
    if (!selectedLayerId) return
    commitDocument(setLayerAsBackground(document, selectedLayerId))
  }, [commitDocument, document, selectedLayerId])

  const deleteSelected = useCallback(() => {
    if (!selectedLayerId) return
    commitDocument({
      ...document,
      layers: document.layers.filter((layer) => layer.id !== selectedLayerId),
    })
    setSelectedLayerId(null)
  }, [commitDocument, document, selectedLayerId])

  const undo = useCallback(() => {
    if (isReadOnlyShare) return
    const previous = past[past.length - 1]
    if (!previous) return
    setPast((items) => items.slice(0, -1))
    setFuture((items) => [cloneDocument(document), ...items])
    setDocument(previous)
    setDirty(true)
  }, [document, isReadOnlyShare, past])

  const redo = useCallback(() => {
    if (isReadOnlyShare) return
    const next = future[0]
    if (!next) return
    setFuture((items) => items.slice(1))
    setPast((items) => [...items, cloneDocument(document)])
    setDocument(next)
    setDirty(true)
  }, [document, future, isReadOnlyShare])

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

  useEffect(() => {
    if (!fileMenuOpen && !downloadMenuOpen) return
    const closeMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.design-editor-menu-wrap')) setFileMenuOpen(false)
      if (!target.closest('.design-editor-download-wrap')) setDownloadMenuOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFileMenuOpen(false)
    }
    window.document.addEventListener('click', closeMenu)
    window.document.addEventListener('keydown', closeOnEscape)
    return () => {
      window.document.removeEventListener('click', closeMenu)
      window.document.removeEventListener('keydown', closeOnEscape)
    }
  }, [downloadMenuOpen, fileMenuOpen])

  const addTextLayer = (preset: Partial<Pick<EditorLayer, 'content' | 'fontSize' | 'fontWeight' | 'fontFamily' | 'width' | 'height'>> = {}) => {
    if (isReadOnlyShare) {
      setShareNotice('当前链接为只读权限，无法修改设计')
      return
    }
    const layer: EditorLayer = {
      id: createLayerId(), type: 'text', x: document.width / 2 - 140, y: document.height / 2 - 28,
      width: 280, height: 56, content: '双击编辑文字', fontSize: 32, fontWeight: 600, fontFamily: 'Source Han Sans SC', color: '#111827', ...preset,
    }
    commitDocument({ ...document, layers: [...document.layers, layer] })
    setSelectedLayerId(layer.id)
    setInspectorOpen(true)
  }

  const addImageLayer = (src: string) => {
    if (isReadOnlyShare) {
      setShareNotice('当前链接为只读权限，无法修改设计')
      return
    }
    const layer: EditorLayer = {
      id: createLayerId(), type: 'image', x: document.width / 2 - 160, y: document.height / 2 - 120,
      width: 320, height: 240, src, opacity: 1, imageEdit: createImageEditState(),
    }
    commitDocument({ ...document, layers: [...document.layers, layer] })
    setSelectedLayerId(layer.id)
    setActiveTool('image')
    setToolPanelOpen(true)
    setInspectorOpen(true)
    setImageUrl('')
  }

  const chooseOfficialScene = (scene: OfficialScene) => {
    commitDocument({ ...document, width: scene.width, height: scene.height })
    setSelectedLayerId(null)
    setInspectorOpen(true)
  }

  const chooseOfficialTemplate = (template: OfficialTemplate) => {
    if (!template.coverPath) return
    addImageLayer(template.coverPath)
  }

  const addOfficialResource = (resource: OfficialResource) => addImageLayer(resource.previewPath)

  const addBackgroundImageLayer = (resource: OfficialResource) => {
    if (isReadOnlyShare) {
      setShareNotice('当前链接为只读权限，无法修改设计')
      return
    }
    const layer: EditorLayer = {
      id: createLayerId(),
      type: 'image',
      x: 0,
      y: 0,
      width: document.width,
      height: document.height,
      src: resource.previewPath,
      opacity: 1,
      imageEdit: createImageEditState(),
    }
    commitDocument({ ...document, layers: [layer, ...document.layers] })
    setSelectedLayerId(layer.id)
    setActiveTool('image')
    setToolPanelOpen(true)
    setInspectorOpen(true)
  }

  const addBrandColor = (color: string) => {
    const nextColor = color.toLowerCase()
    const colors = document.brandColors ?? DEFAULT_BRAND_COLORS
    if (colors.includes(nextColor)) return
    commitDocument({ ...document, brandColors: [...colors, nextColor] })
  }

  const removeBrandColor = (color: string) => {
    commitDocument({ ...document, brandColors: (document.brandColors ?? DEFAULT_BRAND_COLORS).filter((item) => item !== color) })
  }

  const addShapeLayer = (shape: ShapeKind) => {
    if (isReadOnlyShare) {
      setShareNotice('当前链接为只读权限，无法修改设计')
      return
    }
    const layer: EditorLayer = {
      id: createLayerId(), type: 'shape', shape, x: document.width / 2 - 120, y: document.height / 2 - 80,
      width: 240, height: 160, color: shape === 'circle' ? '#8b5cf6' : '#0773fc', opacity: 1,
    }
    commitDocument({ ...document, layers: [...document.layers, layer] })
    setSelectedLayerId(layer.id)
    setInspectorOpen(true)
  }

  const addAsset = (asset: EditorAsset) => {
    if (asset.type === 'audio') {
      setShareNotice('音频素材需要先下载后使用')
      window.setTimeout(() => setShareNotice(''), 2400)
      return
    }
    addImageLayer(asset.src)
    setInspectorOpen(true)
  }

  const setZoom = (next: number) => {
    setZoomMode('manual')
    setScale(Math.max(0.1, Math.min(3, next)))
  }

  const fitCanvas = () => {
    setZoomMode('fit')
    const viewport = canvasViewportRef.current
    if (!viewport) return
    const availableWidth = Math.max(220, viewport.clientWidth - 48)
    const availableHeight = Math.max(220, viewport.clientHeight - 48)
    setScale(Math.min(1, availableWidth / document.width, availableHeight / document.height))
  }

  const onSidebarResizePointerDown = (event: React.PointerEvent<HTMLButtonElement>, axis: 'right' | 'bottom' | 'corner') => {
    const sidebar = event.currentTarget.parentElement
    if (!sidebar) return
    event.preventDefault()
    sidebarResizeRef.current = {
      pointerId: event.pointerId,
      axis,
      startX: event.clientX,
      startY: event.clientY,
      startSize: { width: sidebar.clientWidth, height: sidebar.clientHeight },
      nextSize: sidebarSize,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onSidebarResizePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const resize = sidebarResizeRef.current
    if (!resize || resize.pointerId !== event.pointerId) return
    const sidebar = event.currentTarget.parentElement
    const body = sidebar?.closest('.design-editor-body')
    const maxWidth = Math.max(EDITOR_SIDEBAR_MIN_WIDTH, (body?.clientWidth ?? window.innerWidth) - (inspectorOpen ? 360 : 240))
    const maxHeight = Math.max(EDITOR_SIDEBAR_MIN_HEIGHT, body?.clientHeight ?? window.innerHeight)
    const nextSize = { ...resize.nextSize }
    if (resize.axis === 'right' || resize.axis === 'corner') {
      nextSize.width = Math.max(EDITOR_SIDEBAR_MIN_WIDTH, Math.min(maxWidth, Math.round(resize.startSize.width + event.clientX - resize.startX)))
    }
    if (resize.axis === 'bottom' || resize.axis === 'corner') {
      nextSize.height = Math.max(EDITOR_SIDEBAR_MIN_HEIGHT, Math.min(maxHeight, Math.round(resize.startSize.height + event.clientY - resize.startY)))
    }
    resize.nextSize = nextSize
    setSidebarSize(nextSize)
  }

  const finishSidebarResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    const resize = sidebarResizeRef.current
    if (!resize || resize.pointerId !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    sidebarResizeRef.current = null
    saveSidebarSize(resize.nextSize)
  }

  const onCanvasResizePointerDown = (event: React.PointerEvent<HTMLButtonElement>, axis: 'right' | 'bottom' | 'corner') => {
    event.preventDefault()
    event.stopPropagation()
    if (isReadOnlyShare) {
      setShareNotice('当前链接为只读权限，无法修改设计')
      return
    }
    setZoomMode('manual')
    const startDocument = cloneDocument(document)
    canvasResizeRef.current = {
      pointerId: event.pointerId,
      axis,
      startX: event.clientX,
      startY: event.clientY,
      startDocument,
      currentDocument: startDocument,
      scale,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onCanvasResizePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const resize = canvasResizeRef.current
    if (!resize || resize.pointerId !== event.pointerId) return
    const { scale } = resize
    const dx = event.clientX - resize.startX
    const dy = event.clientY - resize.startY
    const nextDocument = {
      ...resize.startDocument,
      width: resize.axis === 'bottom' ? resize.startDocument.width : clampCanvasSize(resize.startDocument.width + dx / scale),
      height: resize.axis === 'right' ? resize.startDocument.height : clampCanvasSize(resize.startDocument.height + dy / scale),
    }
    if (nextDocument.width === resize.currentDocument.width && nextDocument.height === resize.currentDocument.height) return
    resize.currentDocument = nextDocument
    setDocument(nextDocument)
    setDirty(true)
    collaborationBridgeRef.current?.publish('document-update', { document: cloneDocument(nextDocument) })
  }

  const finishCanvasResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    const resize = canvasResizeRef.current
    if (!resize || resize.pointerId !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    canvasResizeRef.current = null
    if (resize.currentDocument.width === resize.startDocument.width && resize.currentDocument.height === resize.startDocument.height) return
    setPast((items) => [...items.slice(-39), resize.startDocument])
    setFuture([])
  }

  const canvasPoint = (event: React.PointerEvent<HTMLDivElement>): BrushPoint => {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(document.width, (event.clientX - rect.left) / scale)),
      y: Math.max(0, Math.min(document.height, (event.clientY - rect.top) / scale)),
    }
  }

  const onCanvasPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!brushEnabled) {
      setSelectedLayerId(null)
      return
    }
    if (isReadOnlyShare) {
      setShareNotice('当前链接为只读权限，无法修改设计')
      return
    }
    const point = canvasPoint(event)
    brushStrokeRef.current = { pointerId: event.pointerId, points: [point] }
    setSelectedLayerId(null)
    setBrushPreviewPoints([point])
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onCanvasPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const stroke = brushStrokeRef.current
    if (stroke?.pointerId === event.pointerId) {
      const point = canvasPoint(event)
      const lastPoint = stroke.points[stroke.points.length - 1]
      if ((point.x - lastPoint.x) ** 2 + (point.y - lastPoint.y) ** 2 >= 4) {
        stroke.points.push(point)
        setBrushPreviewPoints([...stroke.points])
      }
    }

    const now = Date.now()
    if (now - cursorSentAtRef.current < 40) return
    const point = canvasPoint(event)
    collaborationBridgeRef.current?.publish('cursor', point)
    cursorSentAtRef.current = now
  }

  const onCanvasPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const stroke = brushStrokeRef.current
    if (!stroke || stroke.pointerId !== event.pointerId) return
    const points = [...stroke.points]
    if (points.length === 1) points.push({ ...points[0] })
    const layer: EditorLayer = { id: createLayerId(), type: 'brush', x: 0, y: 0, width: document.width, height: document.height, points, color: brushColor, brushWidth, opacity: brushOpacity }
    brushStrokeRef.current = null
    setBrushPreviewPoints([])
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    commitDocument({ ...document, layers: [...document.layers, layer] })
  }

  const onCanvasPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    const stroke = brushStrokeRef.current
    if (!stroke || stroke.pointerId !== event.pointerId) return
    brushStrokeRef.current = null
    setBrushPreviewPoints([])
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const uploadImage = async (file: File, replaceLayerId?: string) => {
    setSaveState('saving')
    try {
      const uploaded = await aiApi.upload(file)
      if (replaceLayerId) {
        updateLayer(replaceLayerId, { src: uploaded.url, imageEdit: createImageEditState() })
        setSelectedLayerId(replaceLayerId)
        setActiveTool('image')
      } else {
        addImageLayer(uploaded.url)
      }
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }

  const openImagePicker = (mode: 'add' | 'replace' = 'add') => {
    imagePickerModeRef.current = mode
    fileInputRef.current?.click()
  }

  const onLayerPointerDown = (event: React.PointerEvent<HTMLDivElement>, layer: EditorLayer) => {
    event.stopPropagation()
    const owner = layerLocks.get(layer.id)
    if (owner && owner.id !== collaborationActorRef.current?.id) {
      setCollaborationNotice(`${owner.name} 正在编辑这个图层，请稍候。`)
      return
    }
    if (isReadOnlyShare) {
      setShareNotice('当前链接为只读权限，无法修改设计')
      return
    }
    setSelectedLayerId(layer.id)
    if (layer.type === 'image') {
      setActiveTool('image')
      setToolPanelOpen(true)
    }
    setInspectorOpen(true)
    dragRef.current = {
      layerId: layer.id,
      startX: event.clientX,
      startY: event.clientY,
      startDocument: cloneDocument(document),
      scale,
    }
    collaborationBridgeRef.current?.publish('layer-lock', { layerId: layer.id })
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onLayerPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const resize = resizeRef.current
    if (resize && resize.layerId === selectedLayerId) {
      const baseLayer = resize.startDocument.layers.find((layer) => layer.id === resize.layerId)
      if (!baseLayer) return
      const dx = (event.clientX - resize.startX) / resize.scale
      const dy = (event.clientY - resize.startY) / resize.scale
      let nextX = baseLayer.x
      let nextY = baseLayer.y
      let nextWidth = baseLayer.width
      let nextHeight = baseLayer.height
      if (resize.corner.includes('e')) nextWidth = Math.max(24, baseLayer.width + dx)
      if (resize.corner.includes('s')) nextHeight = Math.max(24, baseLayer.height + dy)
      if (resize.corner.includes('w')) {
        nextWidth = Math.max(24, baseLayer.width - dx)
        nextX = baseLayer.x + baseLayer.width - nextWidth
      }
      if (resize.corner.includes('n')) {
        nextHeight = Math.max(24, baseLayer.height - dy)
        nextY = baseLayer.y + baseLayer.height - nextHeight
      }
      const nextDocument = {
        ...resize.startDocument,
        layers: resize.startDocument.layers.map((layer) => layer.id === resize.layerId
          ? { ...layer, x: Math.max(0, nextX), y: Math.max(0, nextY), width: Math.min(nextWidth, resize.startDocument.width), height: Math.min(nextHeight, resize.startDocument.height) }
          : layer),
      }
      setDocument(nextDocument)
      setDirty(true)
      collaborationBridgeRef.current?.publish('document-update', { document: cloneDocument(nextDocument) })
      return
    }
    const drag = dragRef.current
    if (!drag || drag.layerId !== selectedLayerId) return
    const baseLayer = drag.startDocument.layers.find((layer) => layer.id === drag.layerId)
    if (!baseLayer) return
    const dx = (event.clientX - drag.startX) / drag.scale
    const dy = (event.clientY - drag.startY) / drag.scale
    const nextDocument = {
      ...drag.startDocument,
      layers: drag.startDocument.layers.map((layer) => layer.id === drag.layerId
        ? { ...layer, x: Math.max(0, Math.min(drag.startDocument.width - layer.width, baseLayer.x + dx)), y: Math.max(0, Math.min(drag.startDocument.height - layer.height, baseLayer.y + dy)) }
        : layer),
    }
    setDocument(nextDocument)
    setDirty(true)
    collaborationBridgeRef.current?.publish('document-update', { document: cloneDocument(nextDocument) })
  }

  const onLayerPointerUp = () => {
    const resize = resizeRef.current
    if (resize) {
      setPast((items) => [...items.slice(-39), resize.startDocument])
      setFuture([])
      resizeRef.current = null
      collaborationBridgeRef.current?.publish('layer-unlock', { layerId: resize.layerId })
      return
    }
    const drag = dragRef.current
    if (!drag) return
    setPast((items) => [...items.slice(-39), drag.startDocument])
    setFuture([])
    dragRef.current = null
    collaborationBridgeRef.current?.publish('layer-unlock', { layerId: drag.layerId })
  }

  const onResizePointerDown = (event: React.PointerEvent<HTMLSpanElement>, layer: EditorLayer, corner: 'nw' | 'ne' | 'sw' | 'se') => {
    event.stopPropagation()
    if (isReadOnlyShare) {
      setShareNotice('当前链接为只读权限，无法修改设计')
      return
    }
    const owner = layerLocks.get(layer.id)
    if (owner && owner.id !== collaborationActorRef.current?.id) {
      setCollaborationNotice(`${owner.name} 正在编辑这个图层，请稍候。`)
      return
    }
    setSelectedLayerId(layer.id)
    setInspectorOpen(true)
    resizeRef.current = { layerId: layer.id, corner, startX: event.clientX, startY: event.clientY, startDocument: cloneDocument(document), scale }
    collaborationBridgeRef.current?.publish('layer-lock', { layerId: layer.id })
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const exportDesign = async (requestedFormat: 'png' | 'jpeg' = exportFormat) => {
    try {
      await usageApi.consume('export')
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '今日导出额度已用完，请升级会员')
      return
    }
    const options = clampExportOptions({ format: requestedFormat, scale: exportScale, quality: exportQuality })
    const dataUrl = await renderDocumentToDataUrl(document, options)
    const anchor = window.document.createElement('a')
    anchor.download = `${title.trim() || '未命名设计'}.${options.format}`
    anchor.href = dataUrl
    anchor.click()
  }

  const exportPng = () => exportDesign('png')

  const shareDesign = async (mode: 'editable' | 'readonly' = shareMode) => {
    try {
      if (!isLoggedIn) {
        setShareNotice('登录后才能创建分享链接')
        return
      }
      const shared = await designShareApi.create(designId, mode)
      const url = new URL(window.location.href)
      url.pathname = `/editor/${designId}`
      url.search = ''
      url.searchParams.set('shareToken', shared.token)
      await navigator.clipboard.writeText(url.toString())
      setShareMenuOpen(false)
      setShareNotice(mode === 'readonly' ? '只读分享链接已复制' : '可编辑分享链接已复制')
      window.setTimeout(() => setShareNotice(''), 2400)
    } catch {
      setShareNotice('请复制浏览器地址栏中的链接')
      window.setTimeout(() => setShareNotice(''), 3200)
    }
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

  const openTool = (tool: typeof activeTool) => {
    if (tool !== 'brush') setBrushEnabled(false)
    setActiveTool(tool)
    setToolPanelOpen(true)
    if (tool === 'team') {
      setInspectorTab('collaboration')
      setInspectorOpen(true)
    }
  }

  if (!isLoggedIn && !shareToken) {
    return <div className="design-editor-login"><p>登录后才能打开设计编辑器</p><LoginModal /></div>
  }
  if (isLoading) return <div className="design-editor-loading">正在打开设计...</div>
  if (isError || !design) return <div className="design-editor-loading"><p>设计不存在或已被删除</p><button type="button" onClick={() => void refetch()}>重新加载</button></div>

  return (
    <div className="design-editor-shell design-editor-shell--figma" data-editor-visual="figma-workbench">
      <header className="design-editor-topbar">
        <div className="design-editor-topbar-start">
          <button
            type="button"
            className="design-editor-icon-btn"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1)
              } else {
                navigate('/')
              }
            }}
            aria-label="返回"
            title="返回"
          >
            <House className="h-5 w-5" />
          </button>
          <span className="design-editor-topbar-divider" aria-hidden="true" />
          <div className="design-editor-menu-wrap">
            <button type="button" className="design-editor-menu-btn" onClick={() => setFileMenuOpen((open) => !open)} aria-expanded={fileMenuOpen} title="文件操作">
              <FileText className="h-4 w-4" /> 文件 <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {fileMenuOpen ? (
              <div className="design-editor-file-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => { setFileMenuOpen(false); void saveDesign() }} disabled={!dirty || saveState === 'saving' || saveConflict}><Save className="h-4 w-4" />保存当前设计</button>
                <button type="button" role="menuitem" onClick={() => { setFileMenuOpen(false); void exportPng() }}><Download className="h-4 w-4" />导出 PNG</button>
              </div>
            ) : null}
          </div>
          <button type="button" className="design-editor-menu-btn" onClick={() => { setInspectorTab('properties'); setInspectorOpen(true) }}>
            尺寸调整
          </button>
          <span className="design-editor-topbar-divider" aria-hidden="true" />
          <button type="button" className="design-editor-icon-btn" onClick={undo} disabled={!past.length} aria-label="撤销" title="撤销">
            <Undo2 className="h-4 w-4" />
          </button>
          <button type="button" className="design-editor-icon-btn" onClick={redo} disabled={!future.length} aria-label="恢复" title="恢复">
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
        <div className="design-editor-title-wrap">
          <input value={title} readOnly={isReadOnlyShare} onChange={(event) => { if (isReadOnlyShare) return; setTitle(event.target.value); setDirty(true) }} aria-label="设计名称" />
          <span className={cn('design-editor-save-state', saveState === 'error' && 'is-error', saveState === 'conflict' && 'is-conflict')}>
            <Cloud className="h-3.5 w-3.5" />
            {saveState === 'saving' ? '保存中...' : saveState === 'error' ? '保存失败' : saveState === 'conflict' ? '版本冲突' : '已保存'}
          </span>
        </div>
        {shareNotice ? <span className="design-editor-top-notice" role="status">{shareNotice}</span> : null}
        <div className="design-editor-top-actions">
          <button type="button" className="design-editor-icon-btn" onClick={() => { setInspectorTab('collaboration'); setInspectorOpen(true) }} aria-label="协作" title="打开协作面板">
            <UsersRound className="h-4 w-4" />
          </button>
          <div className="design-editor-share-wrap">
            <button type="button" className="design-editor-icon-btn" onClick={() => setShareMenuOpen((open) => !open)} aria-label="分享" title="复制设计链接" aria-expanded={shareMenuOpen}>
            <Share2 className="h-4 w-4" />
            </button>
            {shareMenuOpen ? <div className="design-editor-share-menu" role="menu"><strong>分享权限</strong><button type="button" onClick={() => void shareDesign('editable')}><UsersRound className="h-4 w-4" />可编辑</button><button type="button" onClick={() => void shareDesign('readonly')}><House className="h-4 w-4" />只读</button></div> : null}
          </div>
          <VipMembershipMenu />
          <button type="button" className="design-editor-secondary-btn" onClick={() => navigate('/usercenter/print')}><Printer className="h-4 w-4" />打印</button>
          <button type="button" className="design-editor-action-btn" onClick={() => void saveDesign()} disabled={isReadOnlyShare || !dirty || saveState === 'saving' || saveConflict}>
            <Save className="h-4 w-4" /> 保存
          </button>
          <div className="design-editor-download-wrap">
            <button type="button" className="design-editor-action-btn design-editor-action-btn--primary" onClick={() => void exportDesign()}>
              <Download className="h-4 w-4" /> 下载 {exportFormat.toUpperCase()}
            </button>
            <button type="button" className="design-editor-download-more" onClick={() => setDownloadMenuOpen((open) => !open)} aria-label="更多下载选项" aria-expanded={downloadMenuOpen}><MoreVertical className="h-4 w-4" /></button>
            {downloadMenuOpen ? <div className="design-editor-download-menu"><button type="button" onClick={() => { setDownloadMenuOpen(false); setExportFormat('png'); void exportDesign('png') }}><Download className="h-4 w-4" />下载 PNG</button><button type="button" onClick={() => { setDownloadMenuOpen(false); setExportFormat('jpeg'); void exportDesign('jpeg') }}><FileText className="h-4 w-4" />下载 JPEG</button><label>分辨率<select value={exportScale} onChange={(event) => setExportScale(Number(event.target.value))}><option value="1">1x</option><option value="2">2x</option><option value="3">3x</option><option value="4">4x</option></select></label><label>质量<input type="range" min="0.1" max="1" step="0.05" value={exportQuality} onChange={(event) => setExportQuality(Number(event.target.value))} /></label></div> : null}
          </div>
        </div>
      </header>
      {saveConflict ? <div className="design-editor-conflict-banner" role="alert"><span>检测到其他成员已更新这个设计，本地改动暂未覆盖服务器。</span><div><button type="button" onClick={() => void reloadLatestDesign()}>重新加载最新版本</button><button type="button" onClick={() => { setInspectorTab('collaboration'); setInspectorOpen(true) }}>查看版本历史</button></div></div> : null}
      {remoteUpdateAvailable && !saveConflict ? <div className="design-editor-remote-update-banner" role="status"><span>其他成员已更新这个设计{remoteRevision ? `（V${remoteRevision}）` : ''}，当前画布未被替换。</span><div><button type="button" onClick={() => void reloadLatestDesign()}>加载最新版本</button><button type="button" onClick={dismissRemoteUpdate}>稍后处理</button></div></div> : null}
      {isReadOnlyShare ? <div className="design-editor-share-readonly-banner" role="status"><span>当前为只读分享链接，画布内容可查看和导出，编辑与保存已禁用。</span></div> : null}
      <div className={cn('design-editor-body', toolPanelOpen && 'has-tool-panel', toolPanelOpen && (activeTool === 'text' || activeTool === 'image' || activeTool === 'add') && 'has-resource-panel', inspectorOpen && 'has-inspector')} style={editorBodyStyle}>
        <aside className={cn('design-editor-sidebar', toolPanelOpen && 'is-expanded')}>
          <nav className="design-editor-toolbar" aria-label="编辑工具">
            {([
              ['add', Plus, '添加'], ['my', MousePointer2, '我的'], ['templates', Layers3, '模板'], ['assets', Shapes, '素材'], ['text', Type, '文字'],
              ['image', ImagePlus, '图片'], ['background', PanelTop, '背景'], ['brand', Palette, '品牌'], ['components', Boxes, '组件'], ['ai', Bot, 'AI工具'], ['brush', Paintbrush, '画笔'], ['team', UsersRound, '团队'],
            ] as const).map(([tool, Icon, label]) => (
              <button key={tool} type="button" className={cn(activeTool === tool && toolPanelOpen && 'is-active')} onClick={() => openTool(tool)} aria-current={activeTool === tool ? 'page' : undefined} title={label}>
                <Icon className="h-5 w-5" /><span>{label}</span>
              </button>
            ))}
          </nav>
          {toolPanelOpen ? (
            <section className="design-editor-tool-panel" aria-label={`${activeTool}面板`}>
              <div className="design-editor-tool-panel-head"><strong>{activeTool === 'assets' ? '素材' : activeTool === 'templates' ? '模板' : activeTool === 'my' ? '我的' : activeTool === 'text' ? '文字' : activeTool === 'image' ? '图片' : activeTool === 'background' ? '背景' : activeTool === 'brand' ? '品牌' : activeTool === 'components' ? '组件' : activeTool === 'ai' ? 'AI工具' : activeTool === 'brush' ? '画笔' : activeTool === 'team' ? '团队' : '添加'}</strong><button type="button" onClick={() => setToolPanelOpen(false)} aria-label="收起素材面板">收起</button></div>

              {activeTool === 'assets' ? (
                <>
                  <label className="design-editor-asset-search"><Search className="h-4 w-4" /><input value={assetQuery} onChange={(event) => setAssetQuery(event.target.value)} placeholder="搜索素材" aria-label="搜索素材" /></label>
                  <div className="design-editor-asset-tabs" role="tablist" aria-label="素材类型">{([['assets', '素材'], ['images', '图片'], ['videos', '视频'], ['audio', '音频']] as const).map(([tab, label]) => <button key={tab} type="button" className={cn(assetTab === tab && 'is-active')} onClick={() => setAssetTab(tab)} role="tab" aria-selected={assetTab === tab}>{label}</button>)}</div>
                  <div className="design-editor-asset-filter-grid" aria-label="素材分类快捷入口">
                    <button type="button" className="is-blue" onClick={() => setAssetTag('形状')}><Shapes className="h-3.5 w-3.5" />形状</button>
                    <button type="button" className="is-pink" onClick={() => setAssetTag('线条')}><span aria-hidden="true">┄</span>线条</button>
                    <button type="button" className="is-coral" onClick={() => setAssetTag('插图')}><Sparkles className="h-3.5 w-3.5" />插图</button>
                    <button type="button" className="is-orange" onClick={() => setAssetTag('容器')}><Component className="h-3.5 w-3.5" />容器</button>
                    <button type="button" className="is-mint" onClick={() => setAssetTag('边框')}><span aria-hidden="true">▣</span>边框</button>
                    <button type="button" className="is-cyan" onClick={() => setAssetTag('图标')}><span aria-hidden="true">●</span>图标</button>
                    <button type="button" className="is-amber" onClick={() => setAssetTag('AIGC')}><span aria-hidden="true">AI</span>AIGC</button>
                    <button type="button" className="is-purple" onClick={() => setAssetTag('动图')}><Play className="h-3.5 w-3.5" />动图</button>
                  </div>
                  <div className="design-editor-asset-tags">{assetTags.map((tag) => <button key={tag} type="button" className={cn(assetTag === tag && 'is-active')} onClick={() => setAssetTag(tag)}>{tag}</button>)}</div>
                  <div className="design-editor-asset-section-heading"><strong>AI做同款 <em>NEW</em></strong><button type="button" onClick={() => setAssetTag('全部')}>全部</button></div>
                  {visibleAssets.length ? <div className="design-editor-asset-grid">{visibleAssets.map((asset) => <button key={asset.id} type="button" className="design-editor-asset-card" onClick={() => addAsset(asset)} title={`添加${asset.label}`}><span className="design-editor-asset-thumb">{asset.type === 'videos' ? <Play className="h-4 w-4" /> : asset.type === 'audio' ? <Music2 className="h-4 w-4" /> : null}<img src={asset.src} alt="" /></span><span>{asset.label}</span></button>)}</div> : <p className="design-editor-collaboration-muted">没有匹配的素材</p>}
                  {officialCatalog && officialSelection ? <OfficialCatalogPanel catalog={officialCatalog} selection={officialSelection} mode="assets" selectedCategoryId={officialCategoryId ?? officialSelection.category.id} onSelectCategory={setOfficialCategoryId} onSelectScene={chooseOfficialScene} onSelectTemplate={chooseOfficialTemplate} /> : null}
                  {officialCatalog ? <OfficialResourcePanel heading="公开插画素材" label="公开插画素材" resources={officialAssetResources} onSelect={addOfficialResource} /> : null}
                  {officialCatalogError ? <p className="design-editor-collaboration-muted">公开目录暂不可用，已保留内置内容</p> : null}
                </>
              ) : null}

              {activeTool === 'templates' ? (
                officialCatalog && officialSelection ? <OfficialCatalogPanel catalog={officialCatalog} selection={officialSelection} mode="templates" selectedCategoryId={officialCategoryId ?? officialSelection.category.id} onSelectCategory={setOfficialCategoryId} onSelectScene={chooseOfficialScene} onSelectTemplate={chooseOfficialTemplate} /> : officialCatalogError ? <p className="design-editor-collaboration-muted">公开目录暂不可用，请稍后重试</p> : <p className="design-editor-collaboration-muted">正在加载公开目录...</p>
              ) : null}

              {activeTool === 'my' ? <div className="design-editor-tool-section"><div className="design-editor-tool-section-head"><strong>当前设计图层</strong><span>{document.layers.length} 个</span></div>{document.layers.length ? <div className="design-editor-layer-list">{document.layers.map((layer, index) => <button key={layer.id} type="button" className={cn(selectedLayerId === layer.id && 'is-active')} onClick={() => { setSelectedLayerId(layer.id); setInspectorOpen(true) }}><span>{index + 1}</span><span>{layer.type === 'text' ? layer.content || '文字图层' : layer.type === 'shape' ? '形状图层' : layer.type === 'brush' ? '笔触图层' : '图片图层'}</span></button>)}</div> : <p className="design-editor-collaboration-muted">还没有添加图层</p>}<button type="button" className="design-editor-upload-btn" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" />上传我的图片</button></div> : null}

              {activeTool === 'add' ? <EditorAddPanel onUpload={() => fileInputRef.current?.click()} onAddText={addTextLayer} onAddShape={addShapeLayer} onOpenTool={(tool) => setActiveTool(tool)} onOpenCanvasProperties={() => { setInspectorTab('properties'); setInspectorOpen(true) }} /> : null}

              {activeTool === 'text' ? (
                <>
                  <TextResourcePanel groups={textResourceGroups} fonts={LICENSED_FONTS} onSelect={addOfficialResource} onAddText={addTextLayer} onOpenAiWriter={() => setActiveTool('ai')} />
                  {officialCatalogError ? <p className="design-editor-collaboration-muted">公开目录暂不可用，已保留内置内容</p> : null}
                </>
              ) : null}
              {activeTool === 'image' ? selectedLayer?.type === 'image' ? (
                <ImageEditPanel
                  layer={selectedLayer}
                  readOnly={isReadOnlyShare}
                  onUpdate={(patch) => updateLayer(selectedLayer.id, patch)}
                  onReplace={() => openImagePicker('replace')}
                  onSetBackground={setSelectedImageAsBackground}
                  onClose={() => setSelectedLayerId(null)}
                  onDelete={deleteSelected}
                  onMoveLayer={(direction) => moveLayer(selectedLayer.id, direction)}
                />
              ) : <><ImageResourcePanel groups={imageResourceGroups} imageUrl={imageUrl} onImageUrlChange={setImageUrl} onUpload={() => openImagePicker()} onAddUrl={() => imageUrl.trim() && addImageLayer(imageUrl.trim())} onSelect={addOfficialResource} />{officialCatalogError ? <p className="design-editor-collaboration-muted">公开目录暂不可用，已保留内置内容</p> : null}</> : null}
              {activeTool === 'background' ? <section className="design-editor-tool-section"><label className="design-editor-color-control">背景色<input type="color" value={document.background} onChange={(event) => commitDocument({ ...document, background: event.target.value })} /></label><div className="design-editor-color-swatches">{['#ffffff', '#f8fafc', '#eff6ff', '#fff7ed', '#fef2f2', '#111827'].map((color) => <button key={color} type="button" style={{ background: color }} aria-label={`设置背景色${color}`} onClick={() => commitDocument({ ...document, background: color })} />)}</div>{officialCatalog ? <OfficialResourcePanel heading="公开背景" label="公开背景" resources={officialBackgroundResources} onSelect={addBackgroundImageLayer} /> : null}{officialCatalogError ? <p className="design-editor-collaboration-muted">公开目录暂不可用，已保留内置内容</p> : null}</section> : null}
              {activeTool === 'brand' ? (
                <section className="design-editor-tool-section">
                  <div className="design-editor-tool-section-head"><strong>品牌颜色</strong><span>当前设计</span></div>
                  <label className="design-editor-color-control">新增品牌色<input type="color" aria-label="新增品牌色" value={brandColorInput} disabled={isReadOnlyShare} onChange={(event) => { setBrandColorInput(event.target.value); addBrandColor(event.target.value) }} /></label>
                  <div className="design-editor-color-swatches">
                    {(document.brandColors ?? DEFAULT_BRAND_COLORS).map((color) => (
                      <div key={color} className="design-editor-brand-color">
                        <button type="button" style={{ background: color }} aria-label={`应用品牌色${color}`} onClick={() => commitDocument({ ...document, background: color })} disabled={isReadOnlyShare} />
                        <button type="button" className="design-editor-brand-color-remove" aria-label={`移除品牌色 ${color}`} onClick={() => removeBrandColor(color)} disabled={isReadOnlyShare}><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                  <p className="design-editor-collaboration-muted">品牌颜色会随当前设计保存。</p>
                </section>
              ) : null}
              {activeTool === 'components' ? <section className="design-editor-tool-section"><div className="design-editor-tool-grid design-editor-tool-grid--two"><button type="button" onClick={() => addShapeLayer('rect')}><Shapes className="h-4 w-4" />矩形</button><button type="button" onClick={() => addShapeLayer('circle')}><CircleHelp className="h-4 w-4" />圆形</button></div>{officialCatalog ? <OfficialResourcePanel heading="公开图片组件" label="公开图片组件" resources={officialComponentResources} onSelect={addOfficialResource} /> : null}{officialCatalogError ? <p className="design-editor-collaboration-muted">公开目录暂不可用，已保留内置内容</p> : null}</section> : null}
              {activeTool === 'ai' ? <section className="design-editor-tool-section"><button type="button" className="design-editor-upload-btn" onClick={() => setShareNotice('AI工具入口已打开，请从首页选择具体工具')}><Bot className="h-4 w-4" />AI设计</button><button type="button" className="design-editor-upload-btn" onClick={() => fileInputRef.current?.click()}><Sparkles className="h-4 w-4" />上传图片后处理</button></section> : null}
              {activeTool === 'brush' ? (
                <section className="design-editor-tool-section">
                  <p className="design-editor-hint">启用后可在画布空白处自由绘制，笔触会作为当前设计的一部分保存。</p>
                  <div className="design-editor-brush-controls">
                    <label className="design-editor-brush-control"><span>颜色</span><input type="color" aria-label="画笔颜色" value={brushColor} disabled={isReadOnlyShare} onChange={(event) => setBrushColor(event.target.value)} /><output>{brushColor}</output></label>
                    <label className="design-editor-brush-control"><span>粗细</span><input type="range" aria-label="画笔粗细" min="1" max="48" value={brushWidth} disabled={isReadOnlyShare} onChange={(event) => setBrushWidth(Number(event.target.value))} /><output>{brushWidth}</output></label>
                    <label className="design-editor-brush-control"><span>不透明度</span><input type="range" aria-label="画笔不透明度" min="0.1" max="1" step="0.1" value={brushOpacity} disabled={isReadOnlyShare} onChange={(event) => setBrushOpacity(Number(event.target.value))} /><output>{Math.round(brushOpacity * 100)}%</output></label>
                  </div>
                  <button type="button" className={cn('design-editor-upload-btn', brushEnabled && 'is-active')} disabled={isReadOnlyShare} onClick={() => setBrushEnabled((enabled) => !enabled)}><PenTool className="h-4 w-4" />{brushEnabled ? '关闭画笔' : '启用画笔'}</button>
                </section>
              ) : null}
              {activeTool === 'team' ? <section className="design-editor-tool-section"><p className="design-editor-hint">团队成员、评论和版本历史在右侧协作面板中管理。</p><button type="button" className="design-editor-upload-btn" onClick={() => { setInspectorTab('collaboration'); setInspectorOpen(true) }}><UsersRound className="h-4 w-4" />打开协作面板</button></section> : null}
            </section>
          ) : null}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => {
            const file = event.target.files?.[0]
            const replacementLayerId = imagePickerModeRef.current === 'replace' ? selectedLayerId ?? undefined : undefined
            imagePickerModeRef.current = 'add'
            if (file) void uploadImage(file, replacementLayerId)
            event.target.value = ''
          }} />
          {toolPanelOpen ? <>
            <button type="button" className="design-editor-sidebar-resize-handle is-right" aria-label="调整侧栏宽度" onPointerDown={(event) => onSidebarResizePointerDown(event, 'right')} onPointerMove={onSidebarResizePointerMove} onPointerUp={finishSidebarResize} onPointerCancel={finishSidebarResize} />
            <button type="button" className="design-editor-sidebar-resize-handle is-bottom" aria-label="调整侧栏高度" onPointerDown={(event) => onSidebarResizePointerDown(event, 'bottom')} onPointerMove={onSidebarResizePointerMove} onPointerUp={finishSidebarResize} onPointerCancel={finishSidebarResize} />
            <button type="button" className="design-editor-sidebar-resize-handle is-corner" aria-label="调整侧栏宽高" onPointerDown={(event) => onSidebarResizePointerDown(event, 'corner')} onPointerMove={onSidebarResizePointerMove} onPointerUp={finishSidebarResize} onPointerCancel={finishSidebarResize} />
          </> : null}
        </aside>
        <main className="design-editor-workspace">
          <div className="design-editor-workspace-head">
            <div className="design-editor-history">
              <button type="button" onClick={undo} disabled={!past.length} aria-label="撤销"><Undo2 className="h-4 w-4" /></button>
              <button type="button" onClick={redo} disabled={!future.length} aria-label="重做"><Redo2 className="h-4 w-4" /></button>
            </div>
            <span className="design-editor-workspace-status">{showGuides ? '标尺和参考线已开启' : '画布编辑中'} · {Math.round(scale * 100)}%</span>
          </div>
          <div ref={canvasViewportRef} className="design-editor-canvas-viewport">
            <div className="design-editor-canvas-frame" style={{ width: document.width * scale, height: document.height * scale }}>
              <button type="button" className="design-editor-canvas-resize-handle is-right" aria-label="调整画布宽度" onPointerDown={(event) => onCanvasResizePointerDown(event, 'right')} onPointerMove={onCanvasResizePointerMove} onPointerUp={finishCanvasResize} onPointerCancel={finishCanvasResize} />
              <button type="button" className="design-editor-canvas-resize-handle is-bottom" aria-label="调整画布高度" onPointerDown={(event) => onCanvasResizePointerDown(event, 'bottom')} onPointerMove={onCanvasResizePointerMove} onPointerUp={finishCanvasResize} onPointerCancel={finishCanvasResize} />
              <button type="button" className="design-editor-canvas-resize-handle is-corner" aria-label="调整画布宽高" onPointerDown={(event) => onCanvasResizePointerDown(event, 'corner')} onPointerMove={onCanvasResizePointerMove} onPointerUp={finishCanvasResize} onPointerCancel={finishCanvasResize} />
              <div
                className={cn('design-editor-canvas', showGuides && 'has-guides', brushEnabled && 'is-brush-active')}
                style={{ width: document.width, height: document.height, background: document.background, transform: `scale(${scale})` }}
                onPointerDown={onCanvasPointerDown}
                onPointerMove={onCanvasPointerMove}
                onPointerUp={onCanvasPointerUp}
                onPointerCancel={onCanvasPointerCancel}
              >
                {document.layers.map((layer, index) => (
                  <div
                    key={layer.id}
                    className={cn('design-editor-layer', layer.type === 'brush' && 'design-editor-brush-layer', selectedLayerId === layer.id && 'is-selected')}
                    style={{ left: layer.x, top: layer.y, width: layer.width, height: layer.height, opacity: layer.type === 'brush' ? 1 : layer.opacity ?? 1, zIndex: index + 1, transform: layer.type === 'image' && layer.rotation ? `rotate(${layer.rotation}deg)` : undefined }}
                    onPointerDown={layer.type === 'brush' ? undefined : (event) => onLayerPointerDown(event, layer)}
                    onPointerMove={layer.type === 'brush' ? undefined : onLayerPointerMove}
                    onPointerUp={layer.type === 'brush' ? undefined : onLayerPointerUp}
                  >
                    {layer.type === 'text' ? <span style={{ color: layer.color || '#111827', fontSize: layer.fontSize || 28, fontWeight: layer.fontWeight || 500, fontFamily: layer.fontFamily || 'Source Han Sans SC' }}>{layer.content}</span> : layer.type === 'shape' ? <span className={cn('design-editor-shape', `is-${layer.shape || 'rect'}`)} style={{ background: layer.color || '#0773fc' }} /> : layer.type === 'brush' ? <BrushStroke className="design-editor-brush-stroke" width={document.width} height={document.height} points={layer.points || []} color={layer.color || '#111827'} brushWidth={layer.brushWidth || 1} opacity={layer.opacity ?? 1} /> : <ImageLayerPreview layer={layer} />}
                    <Suspense fallback={null}><CollaborationCanvasSignals cursors={[]} locks={layerLocks} layerId={layer.id} /></Suspense>
                    {layer.type !== 'brush' && selectedLayerId === layer.id ? (['nw', 'ne', 'sw', 'se'] as const).map((corner) => <span key={corner} className={cn('design-editor-resize-handle', `is-${corner}`)} style={{ transform: `scale(${1 / scale})` }} onPointerDown={(event) => onResizePointerDown(event, layer, corner)} />) : null}
                  </div>
                ))}
                {brushPreviewPoints.length ? <BrushStroke className="design-editor-brush-preview" width={document.width} height={document.height} points={brushPreviewPoints} color={brushColor} brushWidth={brushWidth} opacity={brushOpacity} /> : null}
                <Suspense fallback={null}><CollaborationCanvasSignals cursors={remoteCursors} locks={layerLocks} /></Suspense>
                {!document.layers.length && !brushPreviewPoints.length ? <span className="design-editor-canvas-placeholder">双击编辑文字</span> : null}
              </div>
            </div>
          </div>
          <div className="design-editor-bottom-bar">
            <div className="design-editor-page-controls"><button type="button" aria-label="展开画板" title="展开画板"><PanelRight className="h-4 w-4" /></button><span>1</span><button type="button" onClick={() => setShareNotice('当前设计只有一个画板')} aria-label="添加画板" title="添加画板"><Plus className="h-4 w-4" /></button><button type="button" onClick={() => setActiveTool('add')} aria-label="添加元素" title="添加元素"><Sparkles className="h-4 w-4" /></button></div>
            <div className="design-editor-view-controls">
              <button type="button" onClick={() => setZoom(scale - 0.1)} aria-label="缩小" title="缩小"><ZoomOut className="h-4 w-4" /></button>
              <button type="button" className="design-editor-zoom-label" onClick={fitCanvas} title="适应屏幕">{Math.round(scale * 100)}%</button>
              <button type="button" onClick={() => setZoom(scale + 0.1)} aria-label="放大" title="放大"><ZoomIn className="h-4 w-4" /></button>
              <span className="design-editor-bottom-divider" />
              <button type="button" onClick={() => setZoom(1)} title="实际大小">1:1</button>
              <button type="button" onClick={fitCanvas} title="尺寸调整"><Maximize2 className="h-4 w-4" /></button>
              <button type="button" className={cn(showGuides && 'is-active')} onClick={() => setShowGuides((visible) => !visible)} title="标尺和参考线"><Ruler className="h-4 w-4" /></button>
              <button type="button" className={cn(showNavigator && 'is-active')} onClick={() => setShowNavigator((visible) => !visible)} title="导航器"><Navigation className="h-4 w-4" /></button>
              <button type="button" className={cn(inspectorOpen && 'is-active')} onClick={() => { setInspectorTab('properties'); setInspectorOpen((open) => !open) }} title="图层"><Layers3 className="h-4 w-4" /></button>
              <button type="button" onClick={() => setShareNotice('客服入口已记录，请从帮助中心联系支持')} title="客服"><Headphones className="h-4 w-4" /></button>
              <button type="button" onClick={() => setShareNotice('编辑器帮助：点击素材可添加，拖动图层可调整位置')} title="帮助"><CircleHelp className="h-4 w-4" /></button>
            </div>
          </div>
          {showNavigator ? <div className="design-editor-navigator"><div className="design-editor-navigator-head"><strong>导航器</strong><button type="button" onClick={() => setShowNavigator(false)} aria-label="关闭导航器"><X className="h-4 w-4" /></button></div><div className="design-editor-navigator-preview" style={{ aspectRatio: `${document.width} / ${document.height}` }}><span /></div></div> : null}
        </main>
        <aside className={cn('design-editor-inspector', inspectorOpen && 'is-open')}>
          <div className="design-editor-inspector-tabs" role="tablist" aria-label="编辑器侧栏">
            <button type="button" className={cn(inspectorTab === 'properties' && 'is-active')} onClick={() => { setInspectorTab('properties'); setInspectorOpen(true) }} role="tab" aria-selected={inspectorTab === 'properties'}><span>属性</span></button>
            <button type="button" className={cn(inspectorTab === 'collaboration' && 'is-active')} onClick={() => { setInspectorTab('collaboration'); setInspectorOpen(true) }} role="tab" aria-selected={inspectorTab === 'collaboration'}><UsersRound className="h-3.5 w-3.5" /><span>协作</span>{onlineMemberCount > 0 ? <b>{onlineMemberCount}</b> : null}</button>
          </div>
          {inspectorTab === 'properties' ? (
            <>
              <div className="design-editor-inspector-head"><span>{selectedLayer ? '图层属性' : '画布属性'}</span>{selectedLayer ? <button type="button" onClick={deleteSelected} aria-label="删除图层"><Trash2 className="h-4 w-4" /></button> : null}</div>
              {selectedLayer ? (
                <div className="design-editor-inspector-content">
                  <p className="design-editor-inspector-label">{selectedLayer.type === 'text' ? '文字图层' : selectedLayer.type === 'shape' ? '形状图层' : selectedLayer.type === 'brush' ? '笔触图层' : '图片图层'}</p>
                  {selectedLayer.type === 'text' ? (
                    <>
                      <label>文字<textarea value={selectedLayer.content || ''} onChange={(event) => updateLayer(selectedLayer.id, { content: event.target.value })} /></label>
                      <label>字体<select value={selectedLayer.fontFamily || 'Source Han Sans SC'} onChange={(event) => updateLayer(selectedLayer.id, { fontFamily: event.target.value })}>{LICENSED_FONTS.map((font) => <option key={font.id} value={font.family}>{font.displayName}</option>)}</select></label>
                      <label>字号<input type="number" min="8" max="240" value={selectedLayer.fontSize || 28} onChange={(event) => updateLayer(selectedLayer.id, { fontSize: Number(event.target.value) || 28 })} /></label>
                      <label>颜色<input type="color" value={selectedLayer.color || '#111827'} onChange={(event) => updateLayer(selectedLayer.id, { color: event.target.value })} /></label>
                    </>
                  ) : selectedLayer.type === 'shape' ? (
                    <label>颜色<input type="color" value={selectedLayer.color || '#0773fc'} onChange={(event) => updateLayer(selectedLayer.id, { color: event.target.value })} /></label>
                  ) : selectedLayer.type === 'brush' ? (
                    <p className="design-editor-hint">笔触由画布坐标保存，可在左侧“画笔”面板调整下一笔的样式。</p>
                  ) : (
                    <label>图片地址<input value={selectedLayer.src || ''} onChange={(event) => updateLayer(selectedLayer.id, { src: event.target.value })} /></label>
                  )}
                  {selectedLayer.type !== 'brush' ? <div className="design-editor-position-grid">
                    <label>X<input type="number" value={Math.round(selectedLayer.x)} onChange={(event) => updateLayer(selectedLayer.id, { x: Number(event.target.value) || 0 })} /></label>
                    <label>Y<input type="number" value={Math.round(selectedLayer.y)} onChange={(event) => updateLayer(selectedLayer.id, { y: Number(event.target.value) || 0 })} /></label>
                    <label>宽<input type="number" min="1" value={Math.round(selectedLayer.width)} onChange={(event) => updateLayer(selectedLayer.id, { width: Number(event.target.value) || 1 })} /></label>
                    <label>高<input type="number" min="1" value={Math.round(selectedLayer.height)} onChange={(event) => updateLayer(selectedLayer.id, { height: Number(event.target.value) || 1 })} /></label>
                  </div> : null}
                </div>
              ) : (
                <div className="design-editor-inspector-content">
                  <p className="design-editor-inspector-label">画布</p>
                  <div className="design-editor-position-grid">
                    <label>宽度<input type="number" min={CANVAS_SIZE_MIN} max={CANVAS_SIZE_MAX} value={canvasWidthInput} disabled={isReadOnlyShare} onChange={(event) => setCanvasWidthInput(event.target.value)} onBlur={() => { const value = Number(canvasWidthInput); if (Number.isFinite(value)) resizeCanvas({ width: value }); else setCanvasWidthInput(String(document.width)) }} /></label>
                    <label>高度<input type="number" min={CANVAS_SIZE_MIN} max={CANVAS_SIZE_MAX} value={canvasHeightInput} disabled={isReadOnlyShare} onChange={(event) => setCanvasHeightInput(event.target.value)} onBlur={() => { const value = Number(canvasHeightInput); if (Number.isFinite(value)) resizeCanvas({ height: value }); else setCanvasHeightInput(String(document.height)) }} /></label>
                  </div>
                  <label>背景色<input type="color" value={document.background} disabled={isReadOnlyShare} onChange={(event) => commitDocument({ ...document, background: event.target.value })} /></label>
                  <p className="design-editor-hint">从左侧添加文字或图片，然后拖动图层调整位置。</p>
                  <div className="design-editor-image-url"><input placeholder="粘贴图片地址" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} /><button type="button" onClick={() => imageUrl.trim() && addImageLayer(imageUrl.trim())}><Plus className="h-4 w-4" /></button></div>
                  <button type="button" className="design-editor-upload-btn" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" />上传图片</button>
                </div>
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
                    <div className="design-editor-version-compose"><input value={versionNote} maxLength={120} onChange={(event) => setVersionNote(event.target.value)} placeholder="快照备注（可选）" /><button type="button" onClick={() => void createVersion()} disabled={isVersionSaving}><History className="h-3.5 w-3.5" />{isVersionSaving ? '保存中' : '保存快照'}</button></div>
                <div className="design-editor-version-list">{versions.length ? versions.map((version) => <article key={version.id} className="design-editor-version"><div><strong>V{version.versionNo}</strong><span>{memberName(version)} · {formatCollaborationTime(version.createTime)}</span></div><p>{version.note || '设计版本快照'}</p><button type="button" onClick={() => loadVersion(version)}>载入到画布</button></article>) : <p className="design-editor-collaboration-muted">暂无历史版本</p>}</div>
              </section>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
