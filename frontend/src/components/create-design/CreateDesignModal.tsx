import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Search,
  Upload,
  X,
} from 'lucide-react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { ApiError, aiApi, designApi } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { useCreateDesignModal } from '@/context/CreateDesignContext'
import { useDesignActions } from '@/hooks/useDesignActions'
import { cn } from '@/utils'

const UNITS = ['px', 'mm', 'cm'] as const

type DesignUnit = (typeof UNITS)[number]
type SizeTabCode = 'common' | 'favorite' | 'desktop' | 'mobile' | 'print'

interface OfficialScene {
  id: number
  name: string
  width: number
  height: number
  unit?: DesignUnit
  isPrint?: boolean
  iconPath?: string
}

interface OfficialTemplate {
  id: number
  title: string
  width: number
  height: number
  unit?: DesignUnit
  sceneId: number
  sceneName: string
  coverPath: string
}

interface OfficialCategory {
  id: number
  name: string
  scenes: OfficialScene[]
  templates: OfficialTemplate[]
}

interface OfficialCatalog {
  version: number
  categories: OfficialCategory[]
}

const SIZE_TABS: Array<{ code: SizeTabCode; name: string }> = [
  { code: 'common', name: '常用' },
  { code: 'favorite', name: '收藏' },
  { code: 'desktop', name: 'PC端' },
  { code: 'mobile', name: '移动端' },
  { code: 'print', name: '印刷' },
]

async function getOfficialCatalog(): Promise<OfficialCatalog> {
  const response = await fetch('/create-design/official/catalog.json')
  if (!response.ok) throw new Error('Official create-design catalog is unavailable')
  return response.json() as Promise<OfficialCatalog>
}

function formatDimensions(item: Pick<OfficialScene, 'width' | 'height' | 'unit'>) {
  const unit = item.unit ?? 'px'
  return `${item.width}${unit} × ${item.height}${unit}`
}

function getScenesForTab(category: OfficialCategory | undefined, tab: SizeTabCode) {
  const scenes = category?.scenes ?? []
  if (tab === 'favorite') return []
  if (tab === 'print') return scenes.filter((scene) => scene.isPrint)
  if (tab === 'desktop') return scenes.filter((scene) => !scene.isPrint && scene.width >= scene.height)
  if (tab === 'mobile') return scenes.filter((scene) => !scene.isPrint && scene.height > scene.width)
  return scenes.slice(0, 14)
}

function ScenePresetCard({
  scene,
  selected,
  onClick,
}: {
  scene: OfficialScene
  selected: boolean
  onClick: () => void
}) {
  const ratio = scene.width && scene.height ? scene.width / scene.height : 0.56
  const thumbHeight = ratio >= 1 ? 36 : 52
  const thumbWidth = Math.max(18, Math.round(thumbHeight * ratio))

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('create-scene-card shrink-0', selected && 'create-scene-card--active')}
    >
      <div className="create-scene-card__thumb" style={{ width: thumbWidth, height: thumbHeight }}>
        {scene.iconPath ? (
          <img
            src={scene.iconPath}
            alt=""
            className="h-full w-full object-contain"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        ) : null}
      </div>
      <div className="create-scene-card__info">
        <span className="create-scene-card__name">{scene.name}</span>
        <span className="create-scene-card__size">{formatDimensions(scene)}</span>
      </div>
    </button>
  )
}

function MasonryItem({
  template,
  onClick,
}: {
  template: OfficialTemplate
  onClick: () => void
}) {
  const aspectRatio = template.width && template.height
    ? `${template.width} / ${template.height}`
    : '3 / 4'

  return (
    <button type="button" onClick={onClick} className="create-masonry-card group">
      <div className="create-masonry-card__cover" style={{ aspectRatio }}>
        <img
          src={template.coverPath}
          alt={template.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
    </button>
  )
}

export function CreateDesignModal() {
  const navigate = useNavigate()
  const { showCreateModal, closeCreateModal } = useCreateDesignModal()
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const { invalidateSidebar } = useDesignActions()

  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [sizeTabCode, setSizeTabCode] = useState<SizeTabCode>('common')
  const [selectedSceneId, setSelectedSceneId] = useState<number | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [customWidth, setCustomWidth] = useState('800')
  const [customHeight, setCustomHeight] = useState('600')
  const [unit, setUnit] = useState<DesignUnit>('px')
  const [creating, setCreating] = useState(false)
  const [sceneMenuOpen, setSceneMenuOpen] = useState(true)

  const presetScrollRef = useRef<HTMLDivElement>(null)
  const mainScrollRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    data: catalog,
    isLoading: catalogLoading,
    isError: catalogError,
  } = useQuery({
    queryKey: ['officialCreateDesignCatalog'],
    queryFn: getOfficialCatalog,
    enabled: showCreateModal,
    staleTime: Number.POSITIVE_INFINITY,
  })

  const activeCategory = useMemo(
    () => catalog?.categories.find((category) => category.id === categoryId) ?? catalog?.categories[0],
    [catalog, categoryId],
  )
  const visibleScenes = useMemo(
    () => getScenesForTab(activeCategory, sizeTabCode),
    [activeCategory, sizeTabCode],
  )
  const selectedScene = activeCategory?.scenes.find((scene) => scene.id === selectedSceneId)
  const visibleTemplates = useMemo(() => {
    const templates = activeCategory?.templates ?? []
    const normalizedKeyword = keyword.trim().toLocaleLowerCase()
    if (!normalizedKeyword) return templates
    return templates.filter((template) =>
      `${template.title} ${template.sceneName}`.toLocaleLowerCase().includes(normalizedKeyword),
    )
  }, [activeCategory, keyword])

  useEffect(() => {
    if (!catalog?.categories.length) return
    if (!catalog.categories.some((category) => category.id === categoryId)) {
      setCategoryId(catalog.categories[0].id)
    }
  }, [catalog, categoryId])

  useEffect(() => {
    if (!visibleScenes.length) {
      setSelectedSceneId(null)
      return
    }
    if (!visibleScenes.some((scene) => scene.id === selectedSceneId)) {
      const firstScene = visibleScenes[0]
      setSelectedSceneId(firstScene.id)
      setCustomWidth(String(firstScene.width))
      setCustomHeight(String(firstScene.height))
      setUnit(firstScene.unit ?? 'px')
    }
  }, [visibleScenes, selectedSceneId])

  useEffect(() => {
    if (!showCreateModal) {
      setSearchInput('')
      setKeyword('')
      setSelectedSceneId(null)
      return
    }

    const resetScroll = () => {
      mainScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      presetScrollRef.current?.scrollTo({ left: 0, behavior: 'auto' })
    }
    resetScroll()
    const frame = window.requestAnimationFrame(resetScroll)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') closeCreateModal()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [showCreateModal, closeCreateModal])

  const requireLogin = useCallback(() => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return false
    }
    return true
  }, [isLoggedIn, setShowLoginModal])

  const handleCreate = useCallback(
    async (options?: {
      templateId?: number
      templateTitle?: string
      templateCoverUrl?: string
      width?: number
      height?: number
      unit?: DesignUnit
      title?: string
    }) => {
      if (!requireLogin()) return
      setCreating(true)
      try {
        const width = options?.width ?? Number(customWidth)
        const height = options?.height ?? Number(customHeight)
        const design = await designApi.create({
          templateId: options?.templateId,
          templateTitle: options?.templateTitle,
          templateCoverUrl: options?.templateCoverUrl,
          title: options?.title ?? '未命名设计',
          width: Number.isFinite(width) ? width : undefined,
          height: Number.isFinite(height) ? height : undefined,
          unit: options?.unit ?? unit,
        })
        invalidateSidebar()
        closeCreateModal()
        navigate(`/editor/${design.id}`)
      } catch (error) {
        if (error instanceof ApiError && error.code === 401) {
          setShowLoginModal(true)
          alert('登录已过期，请重新登录后再创建设计')
        } else {
          alert(error instanceof Error ? `创建失败：${error.message}` : '创建失败，请稍后重试')
        }
      } finally {
        setCreating(false)
      }
    },
    [requireLogin, customWidth, customHeight, unit, invalidateSidebar, closeCreateModal, navigate, setShowLoginModal],
  )

  const handleImport = async (file: File, type: 'image' | 'file') => {
    if (!requireLogin()) return
    setCreating(true)
    try {
      await aiApi.upload(file)
      const design = await designApi.create({
        title: type === 'image' ? '导入图片' : file.name.replace(/\.[^.]+$/, ''),
        width: 800,
        height: type === 'image' ? 800 : 600,
      })
      invalidateSidebar()
      closeCreateModal()
      navigate(`/editor/${design.id}`)
    } catch {
      alert('导入失败')
    } finally {
      setCreating(false)
    }
  }

  const chooseScene = (scene: OfficialScene) => {
    setSelectedSceneId(scene.id)
    setCustomWidth(String(scene.width))
    setCustomHeight(String(scene.height))
    setUnit(scene.unit ?? 'px')
  }

  if (!showCreateModal) return null

  return (
    <div className="create-design-overlay" onClick={closeCreateModal}>
      <div className="create-design-modal-wrap" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="create-design-modal__close" onClick={closeCreateModal} aria-label="关闭">
          <X className="h-4 w-4" strokeWidth={2.2} />
        </button>

        <div className="create-design-modal animate-fade-in" role="dialog" aria-modal="true" aria-label="创建设计">
          <aside className="create-design-sidebar">
            <h2 className="create-design-sidebar__title">创建设计</h2>
            <div className="create-design-sidebar__section">
              <button type="button" className="create-design-sidebar__section-head" onClick={() => setSceneMenuOpen((open) => !open)}>
                <span>设计场景</span>
                <ChevronDown className={cn('h-4 w-4 transition', sceneMenuOpen && 'rotate-180')} />
              </button>
              {sceneMenuOpen ? (
                <ul className="create-design-sidebar__nav">
                  {catalog?.categories.map((category) => (
                    <li key={category.id}>
                      <button
                        type="button"
                        className={cn('create-design-sidebar__nav-item', activeCategory?.id === category.id && 'create-design-sidebar__nav-item--active')}
                        onClick={() => {
                          setCategoryId(category.id)
                          setSizeTabCode('common')
                          setSelectedSceneId(null)
                        }}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="create-design-sidebar__footer">
              <button type="button" className="create-design-sidebar__import" onClick={() => imageInputRef.current?.click()}>
                <ImagePlus className="h-4 w-4 text-[#0773fc]" />
                导入图片
              </button>
              <button type="button" className="create-design-sidebar__import" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 text-[#0773fc]" />
                导入文件
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void handleImport(file, 'image')
                  event.target.value = ''
                }}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept=".psd,.pdf,.ppt,.pptx,.doc,.docx,.sketch"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void handleImport(file, 'file')
                  event.target.value = ''
                }}
              />
            </div>
          </aside>

          <div ref={mainScrollRef} className="create-design-main hide-scrollbar">
            <div className="create-design-search create-design-search--sticky">
              <Search className="create-design-search__icon h-4 w-4" />
              <input
                type="text"
                value={searchInput}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchInput(event.target.value)}
                onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === 'Enter') setKeyword(searchInput.trim())
                }}
                placeholder="搜索你想要的场景"
                className="create-design-search__input"
              />
              {searchInput ? (
                <button
                  type="button"
                  className="create-design-search__clear"
                  onClick={() => {
                    setSearchInput('')
                    setKeyword('')
                  }}
                  aria-label="清空搜索"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            <div className="create-design-size-bar">
              <span className="create-design-size-bar__title">自定义尺寸</span>
              <div className="create-design-size-bar__controls">
                <label className="create-design-dim">
                  <span className="create-design-dim__label">宽</span>
                  <input type="number" min={1} value={customWidth} onChange={(event) => setCustomWidth(event.target.value)} className="create-design-dim__input" />
                </label>
                <label className="create-design-dim">
                  <span className="create-design-dim__label">高</span>
                  <input type="number" min={1} value={customHeight} onChange={(event) => setCustomHeight(event.target.value)} className="create-design-dim__input" />
                </label>
                <div className="create-design-unit">
                  <select value={unit} onChange={(event) => setUnit(event.target.value as DesignUnit)} className="create-design-unit__select">
                    {UNITS.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <ChevronDown className="create-design-unit__arrow h-3.5 w-3.5" aria-hidden="true" />
                </div>
              </div>
              <button type="button" className="create-design-size-bar__submit" disabled={creating} onClick={() => void handleCreate()}>
                创建设计
              </button>
            </div>

            <div className="create-design-tabs">
              {SIZE_TABS.map((tab) => (
                <button
                  key={tab.code}
                  type="button"
                  className={cn('create-design-tabs__item', sizeTabCode === tab.code && 'create-design-tabs__item--active')}
                  onClick={() => {
                    setSizeTabCode(tab.code)
                    setSelectedSceneId(null)
                  }}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            <div className="create-design-presets-wrap">
              <button type="button" className="create-design-presets-nav create-design-presets-nav--left" onClick={() => presetScrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' })} aria-label="上一组">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div ref={presetScrollRef} className="create-design-presets hide-scrollbar">
                {catalogLoading ? Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="create-scene-card create-scene-card--skeleton shrink-0" />
                )) : visibleScenes.map((scene) => (
                  <ScenePresetCard key={scene.id} scene={scene} selected={selectedSceneId === scene.id} onClick={() => chooseScene(scene)} />
                ))}
              </div>
              <button type="button" className="create-design-presets-nav create-design-presets-nav--right" onClick={() => presetScrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })} aria-label="下一组">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="create-design-templates">
              <div className="create-design-templates__head">
                <h3>{activeCategory?.name ? `${activeCategory.name}模板` : '模板推荐'}</h3>
                <button type="button" className="create-design-templates__more" onClick={() => {
                  closeCreateModal()
                  navigate('/templates')
                }}>
                  更多
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="create-design-templates__body">
                {catalogLoading ? (
                  <div className="create-design-masonry create-design-masonry--loading">
                    {Array.from({ length: 15 }).map((_, index) => <div key={index} className="create-masonry-skeleton" />)}
                  </div>
                ) : visibleTemplates.length ? (
                  <div className="create-design-masonry">
                    {visibleTemplates.map((template) => (
                      <div key={template.id} className="create-design-masonry__item">
                        <MasonryItem
                          template={template}
                          onClick={() => void handleCreate({
                            templateId: template.id,
                            templateTitle: template.title,
                            templateCoverUrl: template.coverPath,
                            title: template.title,
                            width: template.width,
                            height: template.height,
                            unit: template.unit ?? 'px',
                          })}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="create-design-templates__empty">
                    {catalogError ? '官网资源目录尚未同步完成' : selectedScene ? `暂无「${selectedScene.name}」相关模板` : '暂无模板推荐'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
