import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { AiPosterDetailModal } from '@/components/ai-topic/AiPosterDetailModal'
import { InspirationImageCard } from '@/components/ai-topic/InspirationImageCard'
import { AiTopicPosterInput } from '@/components/ai-topic/AiTopicPosterInput'
import { aiTopicApi } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { AiGenerateResultPanel } from '@/components/home/AiGenerateResultPanel'
import type { AiGenerateResult } from '@/types'
import type { AiTopicInspiration, AiTopicPreset } from '@/types/aiTopic'
import { coverFallback } from '@/utils'
import { findInspirationContext } from '@/utils/inspirationMedia'
import { AI_POSTER_TOPIC_FALLBACK } from '@/data/aiPosterTopicFallback'

import '@/styles/ai-topic-page.css'

const PAGE_CODE = 'AIhaibao'
const BANNER_BG = 'https://eyuankupub-cdn-oss.chuangkit.com/teach/www/banner-bg.png'
const TOPIC_TITLE_LINE =
  'https://www.chuangkit.com/distsaas/img/topicname_bg.db8ab2eb.png'

function CoverImage({
  src,
  alt,
  seed,
  className,
}: {
  src?: string
  alt: string
  seed: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const resolved =
    !failed && src && (src.startsWith('http') || src.startsWith('//'))
      ? src
      : coverFallback(seed, 176, 253)

  return (
    <img
      src={resolved}
      alt={alt}
      onError={() => setFailed(true)}
      className={className}
      loading="lazy"
    />
  )
}

function InspirationSection({
  title,
  sectionTitle,
  moreText,
  items,
  onItemClick,
}: {
  title: string
  sectionTitle: string
  moreText: string
  items: AiTopicInspiration[]
  onItemClick: (item: AiTopicInspiration) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [items, updateScrollState])

  const scroll = (dir: 'left' | 'right') => {
    trackRef.current?.scrollBy({ left: dir === 'right' ? 440 : -440, behavior: 'smooth' })
  }

  return (
    <section className="home-section">
      <header className="title">
        <div className="title-name">{title}</div>
        <button type="button" className="m-button">
          <span className="m-button-name">{moreText}</span>
          <ChevronRight className="m-button-icon h-3.5 w-3.5" />
        </button>
      </header>

      <div className="scroll-container">
        {canScrollLeft && (
          <button
            type="button"
            className="scroll-btn scroll-btn-left"
            onClick={() => scroll('left')}
            aria-label="向左滚动"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
        )}
        <div className="content-wrapper">
          <div ref={trackRef} className="l-inspiration">
            {items.map((item, index) => (
              <InspirationImageCard
                key={item.id}
                item={item}
                sectionTitle={sectionTitle}
                cardIndex={index}
                onClick={() => onItemClick(item)}
              />
            ))}
          </div>
        </div>
        {canScrollRight && (
          <button
            type="button"
            className="scroll-btn scroll-btn-right"
            onClick={() => scroll('right')}
            aria-label="向右滚动"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </section>
  )
}

export function AiPosterTopicPage() {
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [prompt, setPrompt] = useState('')
  const [activePresetId, setActivePresetId] = useState<number | null>(null)
  const [generateResult, setGenerateResult] = useState<AiGenerateResult | null>(null)

  const detailId = useMemo(() => {
    const id = Number(searchParams.get('id'))
    return Number.isFinite(id) && id > 0 ? id : null
  }, [searchParams])

  const { data: remoteData, isLoading, error } = useQuery({
    queryKey: ['aiTopic', PAGE_CODE],
    queryFn: () => aiTopicApi.getIndex(PAGE_CODE),
    staleTime: 60_000,
  })

  const data = remoteData ?? (error ? AI_POSTER_TOPIC_FALLBACK : undefined)

  const generateMutation = useMutation({
    mutationFn: (payload: { prompt?: string; presetId?: number; inspirationId?: number }) =>
      aiTopicApi.generate(PAGE_CODE, payload),
    onSuccess: (result) => setGenerateResult(result),
    onError: (err: Error) => alert(err.message || '生成失败，请稍后重试'),
  })

  const runGenerate = useCallback(
    (payload: { prompt?: string; presetId?: number; inspirationId?: number }) => {
      if (!isLoggedIn) {
        setShowLoginModal(true)
        return
      }
      generateMutation.mutate(payload)
    },
    [isLoggedIn, setShowLoginModal, generateMutation],
  )

  const handleGenerate = useCallback(
    (payload: { prompt: string; agentMode?: boolean; autoMode?: boolean }) => {
      runGenerate({
        prompt: payload.prompt,
        presetId: activePresetId ?? undefined,
      })
    },
    [runGenerate, activePresetId],
  )

  const handlePresetClick = useCallback((preset: AiTopicPreset) => {
    setActivePresetId((current) => (current === preset.id ? null : preset.id))
  }, [])

  const handleInspirationClick = useCallback(
    (item: AiTopicInspiration) => {
      setSearchParams({ id: String(item.id) })
    },
    [setSearchParams],
  )

  const closeDetail = useCallback(() => {
    setSearchParams({})
  }, [setSearchParams])

  const handleMakeSame = useCallback(
    (item: AiTopicInspiration) => {
      setActivePresetId(null)
      setPrompt(item.promptText || `生成${item.title}`)
      closeDetail()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [closeDetail],
  )

  const detailContext = useMemo(() => {
    if (!detailId || !data) return null
    return findInspirationContext(data.sections, detailId)
  }, [detailId, data])

  if (isLoading && !data) {
    return (
      <div className="ai-topic-page ai-topic-page--state">
        <div className="ai-topic-page__spinner" />
        <p>加载中...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="ai-topic-page ai-topic-page--state">
        <p>无法加载 AI 海报专题页</p>
        <Link to="/" className="ai-topic-page__back-link">
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <div
      className="ai-topic-page ai-topic-page--poster"
      style={{ '--content-width': '1290px' } as CSSProperties}
    >
      <div
        className="ai-topic-page__main"
        style={{ backgroundImage: `url("${BANNER_BG}")` }}
      >
        <div className="ai-topic-page__content">
          <section className="ai-topic-input-section">
            <nav aria-label="breadcrumb" className="ai-topic-input-section__crumbs">
              <Link to={data.breadcrumbParentUrl || '/tools'} className="crumb-link">
                {data.breadcrumbParent} &gt;
              </Link>
              <span className="crumb-current">{data.title}</span>
            </nav>

            <div className="ai-topic-input-section__canvas">
              <div className="ai-topic-composer">
                <div className="ai-topic-input-shell">
                  <div className="ai-topic-input-shell__inner">
                    <AiTopicPosterInput
                      activePreset={data.presets.find((item) => item.id === activePresetId) ?? null}
                      freePrompt={prompt}
                      onFreePromptChange={setPrompt}
                      onEnhancePrompt={(value) => {
                        setActivePresetId(null)
                        setPrompt(value)
                      }}
                      onGenerate={handleGenerate}
                      generating={generateMutation.isPending}
                    />
                  </div>
                </div>

                <div className="topic-title">
                  <h2 title={data.title} className="topic-title__text">
                    {data.title}
                  </h2>
                  <span
                    aria-hidden
                    className="topic-title__line"
                    style={{ backgroundImage: `url("${TOPIC_TITLE_LINE}")` }}
                  />
                </div>

                <aside aria-label="预置提示词" className="preset-prompt-stack preset-prompt-stack--poster">
                  {data.presets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`preset-prompt-card${activePresetId === preset.id ? ' preset-prompt-card--active' : ''}`}
                      style={{
                        ['--card-x' as string]: `${preset.cardOffsetX}px`,
                        ['--card-r' as string]: `${preset.cardRotateDeg}deg`,
                        ['--card-z' as string]: String(preset.cardZIndex),
                      }}
                      onClick={() => handlePresetClick(preset)}
                    >
                      <p className="preset-prompt-card__title">{preset.title}</p>
                      <div className="preset-prompt-card__cover-wrap">
                        <CoverImage
                          src={preset.coverUrl}
                          alt={preset.title}
                          seed={`preset-${preset.id}`}
                          className="preset-prompt-card__cover"
                        />
                      </div>
                    </button>
                  ))}
                </aside>
              </div>
            </div>
          </section>

          <div className="ai-topic-page__sections">
            {data.sections.map((section) => (
              <InspirationSection
                key={section.id}
                title={section.displayTitle}
                sectionTitle={section.title}
                moreText={section.moreText}
                items={section.items}
                onItemClick={handleInspirationClick}
              />
            ))}
          </div>
        </div>
      </div>

      <AiGenerateResultPanel result={generateResult} onClose={() => setGenerateResult(null)} />

      <AiPosterDetailModal
        open={Boolean(detailId && detailContext)}
        context={detailContext}
        onClose={closeDetail}
        onMakeSame={handleMakeSame}
      />
    </div>
  )
}
