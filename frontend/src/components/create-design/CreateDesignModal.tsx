import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
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
import { createDesignApi, designApi, templateApi, aiApi } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { useCreateDesignModal } from '@/context/CreateDesignContext'
import { useDesignActions } from '@/hooks/useDesignActions'
import type { DesignScene, DesignTemplate } from '@/types'
import { coverFallback, cn } from '@/utils'

const UNITS = ['px', 'mm', 'cm'] as const

function ScenePresetCard({
  scene,
  selected,
  onClick,
}: {
  scene: DesignScene
  selected: boolean
  onClick: () => void
}) {
  const ratio =
    scene.width && scene.height ? scene.width / scene.height : 0.56
  const thumbH = ratio >= 1 ? 36 : 52
  const thumbW = Math.round(thumbH * ratio)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'create-scene-card shrink-0',
        selected && 'create-scene-card--active',
      )}
    >
      <div
        className="create-scene-card__thumb"
        style={{ width: thumbW, height: thumbH }}
      >
        <img
          src={scene.previewUrl || coverFallback(`scene-${scene.code}`, thumbW * 2, thumbH * 2)}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="create-scene-card__info">
        <span className="create-scene-card__name">{scene.name}</span>
        <span className="create-scene-card__size">
          {scene.width}px × {scene.height}px
        </span>
      </div>
    </button>
  )
}

function MasonryItem({
  template,
  onClick,
}: {
  template: DesignTemplate
  onClick: () => void
}) {
  const ratio =
    template.width && template.height
      ? `${template.width} / ${template.height}`
      : '3 / 4'

  return (
    <button type="button" onClick={onClick} className="create-masonry-card group">
      <div className="create-masonry-card__cover" style={{ aspectRatio: ratio }}>
        <img
          src={template.coverUrl || coverFallback(template.id)}
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

  const [navCode, setNavCode] = useState('recommend')
  const [sizeTabCode, setSizeTabCode] = useState('common')
  const [selectedSceneId, setSelectedSceneId] = useState<number | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [customWidth, setCustomWidth] = useState('800')
  const [customHeight, setCustomHeight] = useState('600')
  const [unit, setUnit] = useState<(typeof UNITS)[number]>('px')
  const [creating, setCreating] = useState(false)
  const [sceneMenuOpen, setSceneMenuOpen] = useState(true)

  const presetScrollRef = useRef<HTMLDivElement>(null)
  const mainScrollRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: indexData } = useQuery({
    queryKey: ['createDesignIndex'],
    queryFn: createDesignApi.getIndex,
    enabled: showCreateModal,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (indexData) {
      setNavCode(indexData.defaultNavCode)
      setSizeTabCode(indexData.defaultSizeTabCode)
    }
  }, [indexData])

  useEffect(() => {
    if (!showCreateModal) {
      setSearchInput('')
      setKeyword('')
      setSelectedSceneId(null)
      return
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') closeCreateModal()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [showCreateModal, closeCreateModal])

  const { data: presetScenes, isLoading: scenesLoading } = useQuery({
    queryKey: ['createDesignScenes', navCode, sizeTabCode, keyword],
    queryFn: () => createDesignApi.listScenes({ navCode, sizeTabCode, keyword }),
    enabled: showCreateModal && !!navCode,
    staleTime: 10_000,
  })

  useEffect(() => {
    if (presetScenes?.length) {
      const stillValid = presetScenes.some((s) => s.id === selectedSceneId)
      if (!stillValid) {
        setSelectedSceneId(presetScenes[0].id)
        const first = presetScenes[0]
        setCustomWidth(String(first.width))
        setCustomHeight(String(first.height))
      }
    } else {
      setSelectedSceneId(null)
    }
  }, [presetScenes, selectedSceneId])

  const {
    data: templatePages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: templatesLoading,
  } = useInfiniteQuery({
    queryKey: ['createDesignTemplates', navCode, sizeTabCode, selectedSceneId, keyword],
    queryFn: ({ pageParam = 1 }) =>
      createDesignApi.listTemplates({
        navCode,
        sizeTabCode,
        sceneId: selectedSceneId ?? undefined,
        keyword: keyword || undefined,
        page: pageParam,
        pageSize: 24,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    enabled: showCreateModal,
    staleTime: 10_000,
  })

  const templates = useMemo(
    () => templatePages?.pages.flatMap((p) => p.list) ?? [],
    [templatePages],
  )

  const selectedScene = presetScenes?.find((s) => s.id === selectedSceneId)

  const requireLogin = useCallback(() => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return false
    }
    return true
  }, [isLoggedIn, setShowLoginModal])

  const handleCreate = useCallback(
    async (opts?: { sceneId?: number; width?: number; height?: number; title?: string }) => {
      if (!requireLogin()) return
      setCreating(true)
      try {
        const w = opts?.width ?? Number(customWidth)
        const h = opts?.height ?? Number(customHeight)
        await designApi.create({
          sceneId: opts?.sceneId ?? selectedSceneId ?? undefined,
          title: opts?.title ?? '未命名设计',
          width: Number.isFinite(w) ? w : undefined,
          height: Number.isFinite(h) ? h : undefined,
          unit,
        })
        invalidateSidebar()
        closeCreateModal()
        alert('设计已创建')
      } catch {
        alert('创建失败，请确认后端已启动并已登录')
      } finally {
        setCreating(false)
      }
    },
    [
      requireLogin,
      customWidth,
      customHeight,
      selectedSceneId,
      unit,
      invalidateSidebar,
      closeCreateModal,
    ],
  )

  const handleTemplateClick = useCallback(
    async (t: DesignTemplate) => {
      if (!requireLogin()) return
      setCreating(true)
      try {
        await templateApi.use(t.id)
        await designApi.create({ templateId: t.id, title: t.title })
        invalidateSidebar()
        closeCreateModal()
        alert(`已基于「${t.title}」创建设计`)
      } catch {
        alert('操作失败，请确认后端已启动')
      } finally {
        setCreating(false)
      }
    },
    [requireLogin, invalidateSidebar, closeCreateModal],
  )

  const handleSearch = () => setKeyword(searchInput.trim())

  const handleImport = async (file: File, type: 'image' | 'file') => {
    if (!requireLogin()) return
    setCreating(true)
    try {
      const uploaded = await aiApi.upload(file)
      await designApi.create({
        title: type === 'image' ? '导入图片' : file.name.replace(/\.[^.]+$/, ''),
        width: 800,
        height: type === 'image' ? 800 : 600,
      })
      invalidateSidebar()
      closeCreateModal()
      alert(`已导入${type === 'image' ? '图片' : '文件'}：${uploaded.filename}`)
    } catch {
      alert('导入失败')
    } finally {
      setCreating(false)
    }
  }

  const scrollPresets = (dir: 'left' | 'right') => {
    const el = presetScrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })
  }

  if (!showCreateModal) return null

  const handleClearSearch = () => {
    setSearchInput('')
    setKeyword('')
  }

  return (
    <div className="create-design-overlay" onClick={closeCreateModal}>
      <div className="create-design-modal-wrap" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="create-design-modal__close"
          onClick={closeCreateModal}
          aria-label="关闭"
        >
          <X className="h-4 w-4" strokeWidth={2.2} />
        </button>

        <div
          className="create-design-modal animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="创建设计"
        >
        <aside className="create-design-sidebar">
          <h2 className="create-design-sidebar__title">创建设计</h2>

          <div className="create-design-sidebar__section">
            <button
              type="button"
              className="create-design-sidebar__section-head"
              onClick={() => setSceneMenuOpen((v) => !v)}
            >
              <span>设计场景</span>
              <ChevronDown
                className={cn('h-4 w-4 transition', sceneMenuOpen && 'rotate-180')}
              />
            </button>
            {sceneMenuOpen && (
              <ul className="create-design-sidebar__nav">
                {(indexData?.navItems ?? []).map((item) => (
                  <li key={item.code}>
                    <button
                      type="button"
                      className={cn(
                        'create-design-sidebar__nav-item',
                        navCode === item.code && 'create-design-sidebar__nav-item--active',
                      )}
                      onClick={() => {
                        setNavCode(item.code)
                        setSelectedSceneId(null)
                      }}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="create-design-sidebar__footer">
            <button
              type="button"
              className="create-design-sidebar__import"
              onClick={() => imageInputRef.current?.click()}
            >
              <ImagePlus className="h-4 w-4 text-[#0773fc]" />
              导入图片
            </button>
            <button
              type="button"
              className="create-design-sidebar__import"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 text-[#0773fc]" />
              导入文件
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleImport(f, 'image')
                e.target.value = ''
              }}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".psd,.pdf,.ppt,.pptx,.doc,.docx,.sketch"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleImport(f, 'file')
                e.target.value = ''
              }}
            />
          </div>
        </aside>

        <div
          ref={mainScrollRef}
          className="create-design-main hide-scrollbar"
          onScroll={(e) => {
            const el = e.currentTarget
            if (
              hasNextPage &&
              !isFetchingNextPage &&
              el.scrollHeight - el.scrollTop - el.clientHeight < 120
            ) {
              fetchNextPage()
            }
          }}
        >
          <div className="create-design-search create-design-search--sticky">
              <Search className="create-design-search__icon h-4 w-4" />
              <input
                type="text"
                value={searchInput}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索你想要的场景"
                className="create-design-search__input"
              />
              {searchInput ? (
                <button
                  type="button"
                  className="create-design-search__clear"
                  onClick={handleClearSearch}
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
                  <input
                    type="number"
                    min={1}
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    className="create-design-dim__input"
                  />
                </label>
                <label className="create-design-dim">
                  <span className="create-design-dim__label">高</span>
                  <input
                    type="number"
                    min={1}
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    className="create-design-dim__input"
                  />
                </label>
                <div className="create-design-unit">
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as (typeof UNITS)[number])}
                    className="create-design-unit__select"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="create-design-unit__arrow h-3.5 w-3.5" aria-hidden="true" />
                </div>
              </div>
              <button
                type="button"
                className="create-design-size-bar__submit"
                disabled={creating}
                onClick={() => handleCreate()}
              >
                创建设计
              </button>
            </div>

            <div className="create-design-tabs">
              {(indexData?.sizeTabs ?? []).map((tab) => (
                <button
                  key={tab.code}
                  type="button"
                  className={cn(
                    'create-design-tabs__item',
                    sizeTabCode === tab.code && 'create-design-tabs__item--active',
                  )}
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
              <button
                type="button"
                className="create-design-presets-nav create-design-presets-nav--left"
                onClick={() => scrollPresets('left')}
                aria-label="上一组"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div ref={presetScrollRef} className="create-design-presets hide-scrollbar">
                {scenesLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="create-scene-card create-scene-card--skeleton shrink-0" />
                    ))
                  : presetScenes?.map((scene) => (
                      <ScenePresetCard
                        key={scene.id}
                        scene={scene}
                        selected={selectedSceneId === scene.id}
                        onClick={() => {
                          setSelectedSceneId(scene.id)
                          setCustomWidth(String(scene.width))
                          setCustomHeight(String(scene.height))
                        }}
                      />
                    ))}
              </div>
              <button
                type="button"
                className="create-design-presets-nav create-design-presets-nav--right"
                onClick={() => scrollPresets('right')}
                aria-label="下一组"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          <div className="create-design-templates">
            <div className="create-design-templates__head">
              <h3>模板推荐</h3>
              <button
                type="button"
                className="create-design-templates__more"
                onClick={() => {
                  closeCreateModal()
                  navigate('/templates')
                }}
              >
                更多
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="create-design-templates__body">
              {templatesLoading && !templates.length ? (
                <div className="create-design-masonry create-design-masonry--loading">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="create-masonry-skeleton" />
                  ))}
                </div>
              ) : templates.length ? (
                <div className="create-design-masonry">
                  {templates.map((t) => (
                    <div key={t.id} className="create-design-masonry__item">
                      <MasonryItem template={t} onClick={() => handleTemplateClick(t)} />
                    </div>
                  ))}
                  {isFetchingNextPage &&
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={`more-${i}`} className="create-masonry-skeleton" />
                    ))}
                </div>
              ) : (
                <div className="create-design-templates__empty">
                  {selectedScene
                    ? `暂无「${selectedScene.name}」相关模板`
                    : '暂无模板推荐'}
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
