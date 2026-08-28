import { useRef, useState, useEffect, type CSSProperties } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Sparkles, ChevronDown, X, Loader2, ImageIcon, Film, Ratio } from 'lucide-react'
import { Search, Camera } from '@/components/layout/LayoutParts'
import { aiApi } from '@/api'
import type { SearchTab, HotTag, AiGenerateResult } from '@/types'
import { cn } from '@/utils'

interface Props {
  searchTabs: SearchTab[]
  hotTags: HotTag[]
  onSearch: (keyword: string, tabCode: string) => void
  onModeChange?: (code: string) => void
  onGenerate?: (result: AiGenerateResult) => void
}

const TAB_THEME: Record<
  string,
  {
    accent: string
    accentLight: string
    glow: string
    barBorder: string
    btnGradient: string
    btnDisabled: string
    tagHover: string
  }
> = {
  template: {
    accent: '#1677ff',
    accentLight: '#e8f3ff',
    glow: 'rgba(22,119,255,0.18)',
    barBorder: 'rgba(22,119,255,0.15)',
    btnGradient: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
    btnDisabled: '#b8d4ff',
    tagHover: '#1677ff',
  },
  agent: {
    accent: '#722ed1',
    accentLight: '#f3ebff',
    glow: 'rgba(114,46,209,0.18)',
    barBorder: 'rgba(114,46,209,0.15)',
    btnGradient: 'linear-gradient(135deg, #9254de 0%, #722ed1 100%)',
    btnDisabled: '#d3adf7',
    tagHover: '#722ed1',
  },
  image_gen: {
    accent: '#fa8c16',
    accentLight: '#fff7e6',
    glow: 'rgba(250,140,22,0.16)',
    barBorder: 'rgba(250,140,22,0.15)',
    btnGradient: 'linear-gradient(135deg, #ffc069 0%, #fa8c16 100%)',
    btnDisabled: '#ffd591',
    tagHover: '#fa8c16',
  },
  video_gen: {
    accent: '#13c2c2',
    accentLight: '#e6fffb',
    glow: 'rgba(19,194,194,0.16)',
    barBorder: 'rgba(19,194,194,0.15)',
    btnGradient: 'linear-gradient(135deg, #36cfc9 0%, #13c2c2 100%)',
    btnDisabled: '#87e8de',
    tagHover: '#13c2c2',
  },
}

const DEFAULT_THEME = TAB_THEME.template

type TabKey = 'template' | 'agent' | 'image' | 'video'

const TAB_KEY_MAP: Record<string, TabKey> = {
  template: 'template',
  agent: 'agent',
  image_gen: 'image',
  video_gen: 'video',
}

const TAB_ASSETS: Record<
  TabKey,
  { inactiveBg: string; activeBg: string; icon: string }
> = {
  template: {
    inactiveBg: '/hero-tabs/gen-template.3d7efa82.svg',
    activeBg: '/hero-tabs/gen-template-active.ff56b320.svg',
    icon: '/hero-tabs/gen-template-icon.b410de73.png',
  },
  agent: {
    inactiveBg: '/hero-tabs/gen-agent.44520cef.svg',
    activeBg: '/hero-tabs/gen-agent-active.047f758e.svg',
    icon: '/hero-tabs/gen-agent-icon.5866b138.png',
  },
  image: {
    inactiveBg: '/hero-tabs/gen-image.4a90d68a.svg',
    activeBg: '/hero-tabs/gen-image-active.291cf263.svg',
    icon: '/hero-tabs/gen-image-icon.a4020633.png',
  },
  video: {
    inactiveBg: '/hero-tabs/video-bg.56956e5b.svg',
    activeBg: '/hero-tabs/video-active-bg.537d9dee.svg',
    icon: '/hero-tabs/gen-video-icon.b5631175.png',
  },
}

function getTabKey(code: string): TabKey {
  return TAB_KEY_MAP[code] ?? 'template'
}

function HeroBackground({ accent }: { accent: string }) {
  return (
    <div className="hero-search-bg pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden">
      <div
        className="hero-search-bg-mesh"
        style={{ '--hero-accent': accent } as CSSProperties}
      />
      <div className="hero-search-orb hero-search-orb--1" style={{ background: accent }} />
      <div className="hero-search-orb hero-search-orb--2" />
      <div className="hero-search-orb hero-search-orb--3" />
      <div className="hero-search-grid" />
    </div>
  )
}

function ToolbarPill({
  active,
  onClick,
  children,
  accent,
}: {
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
  accent: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition',
        active
          ? 'font-medium text-white shadow-sm'
          : 'bg-[#f5f6f7] text-ckt-text-secondary hover:bg-[#eef0f3]',
      )}
      style={active ? { background: accent } : undefined}
    >
      {children}
    </button>
  )
}

function SelectPill({
  value,
  options,
  onChange,
  icon,
}: {
  value: string
  options: { code: string; name: string }[]
  onChange: (code: string) => void
  icon?: React.ReactNode
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="hero-select-pill appearance-none"
      >
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            {o.name}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8f959e]">
        {icon}
      </span>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8f959e]" />
    </div>
  )
}

export function HeroSearch({ searchTabs, hotTags, onSearch, onModeChange, onGenerate }: Props) {
  const [activeTab, setActiveTab] = useState(searchTabs[0]?.code ?? 'template')
  const [prompt, setPrompt] = useState('')
  const [focused, setFocused] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [referenceUrls, setReferenceUrls] = useState<string[]>([])
  const [agentMode, setAgentMode] = useState(true)
  const [autoMode, setAutoMode] = useState(false)
  const [model, setModel] = useState('')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [style, setStyle] = useState('general')
  const fileRef = useRef<HTMLInputElement>(null)

  const isAiTab = activeTab !== 'template'
  const theme = TAB_THEME[activeTab] ?? DEFAULT_THEME
  const currentTab = searchTabs.find((t) => t.code === activeTab) ?? searchTabs[0]
  const canGenerate = prompt.trim().length > 0 && !generating

  const { data: aiConfig } = useQuery({
    queryKey: ['aiConfig', activeTab],
    queryFn: () => aiApi.getConfig(activeTab),
    enabled: isAiTab,
    staleTime: 300_000,
  })

  useEffect(() => {
    if (!aiConfig) return
    if (aiConfig.models.length && !model) setModel(aiConfig.models[0].code)
    if (aiConfig.aspectRatios.length) setAspectRatio(aiConfig.aspectRatios[0].code)
    if (aiConfig.styles.length) setStyle(aiConfig.styles[0].code)
  }, [aiConfig, model])

  useEffect(() => {
    setModel('')
  }, [activeTab])

  const handleTabChange = (code: string) => {
    setActiveTab(code)
    setPrompt('')
    setReferenceUrls([])
    onModeChange?.(code)
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of Array.from(files).slice(0, 3)) {
        const res = await aiApi.upload(file)
        urls.push(res.url)
      }
      setReferenceUrls((prev) => [...prev, ...urls].slice(0, 3))
    } catch {
      alert('上传失败，请确认后端已启动')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleGenerate = async (overridePrompt?: string, toolCode?: string) => {
    const text = (overridePrompt ?? prompt).trim()
    if (!text || generating) return
    setGenerating(true)
    try {
      const result = await aiApi.generate({
        mode: activeTab,
        prompt: text,
        model: model || undefined,
        aspectRatio,
        style: style || undefined,
        referenceUrls: referenceUrls.length ? referenceUrls : undefined,
        agentMode,
        autoMode,
        toolCode,
      })
      onGenerate?.(result)
    } catch (e) {
      alert(e instanceof Error ? e.message : '生成失败')
    } finally {
      setGenerating(false)
    }
  }

  const handleTemplateSearch = () => {
    onSearch(prompt.trim(), activeTab)
  }

  const promptTags = isAiTab
    ? (aiConfig?.promptTags ?? [])
    : hotTags.map((t) => ({ name: t.name, keyword: t.searchKeyword }))

  const renderToolbar = () => {
    if (activeTab === 'template') return null

    if (activeTab === 'agent') {
      return (
        <>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e8eaed] text-[#8f959e] transition hover:border-ckt-primary/40 hover:text-ckt-primary"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </button>
          <ToolbarPill active={agentMode} accent={theme.accent} onClick={() => setAgentMode(!agentMode)}>
            <Sparkles className="h-3.5 w-3.5" />
            Agent模式
          </ToolbarPill>
          <ToolbarPill active={autoMode} accent={theme.accent} onClick={() => setAutoMode(!autoMode)}>
            自动
          </ToolbarPill>
        </>
      )
    }

    if (activeTab === 'image_gen') {
      return (
        <>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e8eaed] text-[#8f959e] transition hover:border-ckt-primary/40 hover:text-ckt-primary"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </button>
          <ToolbarPill active accent={theme.accent}>
            <ImageIcon className="h-3.5 w-3.5" />
            生图片
          </ToolbarPill>
          {aiConfig?.models.length ? (
            <SelectPill
              value={model}
              options={aiConfig.models}
              onChange={setModel}
              icon={<Sparkles className="h-3 w-3" />}
            />
          ) : null}
          {aiConfig?.aspectRatios.length ? (
            <SelectPill
              value={aspectRatio}
              options={aiConfig.aspectRatios}
              onChange={setAspectRatio}
              icon={<Ratio className="h-3 w-3" />}
            />
          ) : null}
          {aiConfig?.styles.length ? (
            <SelectPill value={style} options={aiConfig.styles} onChange={setStyle} />
          ) : null}
        </>
      )
    }

    if (activeTab === 'video_gen') {
      return (
        <>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e8eaed] text-[#8f959e] transition hover:border-ckt-primary/40 hover:text-ckt-primary"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </button>
          <ToolbarPill active accent={theme.accent}>
            <Film className="h-3.5 w-3.5" />
            生视频
          </ToolbarPill>
          {aiConfig?.models.length ? (
            <SelectPill value={model} options={aiConfig.models} onChange={setModel} />
          ) : null}
          {aiConfig?.aspectRatios.length ? (
            <SelectPill
              value={aspectRatio}
              options={aiConfig.aspectRatios}
              onChange={setAspectRatio}
              icon={<Ratio className="h-3 w-3" />}
            />
          ) : null}
        </>
      )
    }

    return null
  }

  return (
    <section className="relative w-full pb-10 pt-6">
      <HeroBackground accent={theme.accent} />

      <h1 className="hero-search-title relative mb-10 text-center text-[32px] font-semibold tracking-tight">
        <span className="hero-search-title-text">今天你想做些什么？</span>
      </h1>

      <div className="relative mx-auto max-w-[880px]">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />

        <div
          className="hero-router-tab"
          style={
            {
              '--hero-accent': theme.accent,
              '--hero-glow': theme.glow,
              '--bar-border': theme.barBorder,
            } as CSSProperties
          }
        >
          <div
            className={cn(
              'hero-router-tab__tabs',
              `hero-router-tab__tabs--active-${getTabKey(activeTab)}`,
            )}
            role="tablist"
            aria-label="创作模式"
          >
            {searchTabs.map((tab, index) => {
              const isActive = activeTab === tab.code
              const tabKey = getTabKey(tab.code)
              const assets = TAB_ASSETS[tabKey]
              return (
                <button
                  key={tab.code}
                  type="button"
                  role="tab"
                  data-key={tabKey}
                  aria-selected={isActive}
                  onClick={() => handleTabChange(tab.code)}
                  className={cn('hero-router-tab__tab', isActive && 'active')}
                  style={{ zIndex: isActive ? 10 : searchTabs.length - index }}
                >
                  <img
                    src={isActive ? assets.activeBg : assets.inactiveBg}
                    alt=""
                    className={cn(
                      'hero-router-tab__tab-bg',
                      tabKey === 'video' && 'hero-router-tab__tab-bg--video',
                    )}
                  />
                  <span className="hero-router-tab__tab-content">
                    <span className="hero-router-tab__tab-label">{tab.name}</span>
                    <img src={assets.icon} alt="" className="hero-router-tab__tab-icon" />
                  </span>
                </button>
              )
            })}
          </div>

          <div
            className={cn(
              'hero-router-tab__input',
              `hero-router-tab__input--${getTabKey(activeTab)}`,
              focused && 'hero-router-tab__input--focused',
            )}
          >
            <div className="hero-router-tab__input-card">
          {isAiTab ? (
            <div className="hero-ai-panel">
              {referenceUrls.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2 px-1">
                  {referenceUrls.map((url, i) => (
                    <div key={url} className="group relative h-14 w-14 overflow-hidden rounded-lg border border-[#e8eaed]">
                      <img src={url} alt={`参考图${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setReferenceUrls((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={currentTab?.placeholder ?? '上传参考图片，描述下您想要的内容，我们会为您呈现...'}
                rows={4}
                className="hero-ai-textarea w-full resize-none bg-transparent text-[14px] leading-relaxed outline-none placeholder:text-[#bbbfc4]"
              />

              <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#f0f1f3] pt-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">{renderToolbar()}</div>
                <button
                  type="button"
                  disabled={!canGenerate}
                  onClick={() => handleGenerate()}
                  className={cn(
                    'hero-generate-btn shrink-0 rounded-[10px] px-6 py-2 text-[14px] font-medium text-white transition',
                    !canGenerate && 'cursor-not-allowed opacity-70',
                  )}
                  style={{
                    background: canGenerate ? theme.btnGradient : theme.btnDisabled,
                  }}
                >
                  {generating ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      生成中
                    </span>
                  ) : (
                    '生成'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className={cn('hero-search-bar', focused && 'hero-search-bar--focused')}>
              <Search
                className="hero-search-bar__icon shrink-0"
                style={{ color: focused ? theme.accent : '#8693ab' }}
              />
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => e.key === 'Enter' && handleTemplateSearch()}
                placeholder={currentTab?.placeholder ?? '输入关键词搜索'}
                className="hero-search-bar__input min-w-0 flex-1 bg-transparent outline-none"
              />
              <button
                type="button"
                className="hero-search-bar__camera shrink-0"
                aria-label="以图搜图"
              >
                <Camera className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleTemplateSearch}
                className="hero-search-bar__btn shrink-0"
              >
                搜索
              </button>
            </div>
          )}
            </div>
          </div>
        </div>

        <div className="hero-hot-tags mt-5 flex flex-wrap items-center justify-center gap-2">
          {promptTags.map((tag, index) => (
            <button
              key={`${tag.name}-${tag.keyword}`}
              type="button"
              onClick={() => {
                setPrompt(tag.keyword)
                if (isAiTab) {
                  void handleGenerate(tag.keyword)
                } else {
                  onSearch(tag.keyword, activeTab)
                }
              }}
              className={cn('hero-hot-tag', index < 3 && !isAiTab && 'hero-hot-tag--featured')}
              style={
                {
                  '--tag-hover': theme.tagHover,
                  '--tag-accent-light': theme.accentLight,
                } as CSSProperties
              }
            >
              {!isAiTab && hotTags[index]?.emoji && (
                <span className="hero-hot-tag-emoji">{hotTags[index].emoji}</span>
              )}
              <span>{tag.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
