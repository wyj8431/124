import { useRef, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from '@/components/layout/LayoutParts'
import { homeApi, templateApi } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { RecommendTemplateCard } from './RecommendTemplateCard'
import type { AiGenerateResult, DesignTemplate, HomeSectionCard, RecommendTemplate } from '@/types'

interface Props {
  sectionCode: string
  onUseTemplate?: (t: DesignTemplate) => void
  onReferenceResult?: (result: AiGenerateResult) => void
}

function toRecommendTemplate(card: HomeSectionCard): RecommendTemplate {
  return {
    id: card.templateId,
    title: card.title,
    coverUrl: card.coverUrl,
    sceneId: 0,
    categoryId: 0,
    width: card.width ?? 1080,
    height: card.height ?? 1920,
    useCount: 0,
    isFree: card.isFree ?? 1,
    isHot: 0,
    isRecommend: 0,
    liked: false,
    likeCount: 0,
  }
}

export function TopicRecommendSection({ sectionCode, onUseTemplate, onReferenceResult }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const [generatingId, setGeneratingId] = useState<number | null>(null)
  const [likedMap, setLikedMap] = useState<
    Record<number, { liked: boolean; likeCount: number }>
  >({})

  const { data: section, isLoading } = useQuery({
    queryKey: ['homeSection', sectionCode],
    queryFn: () => homeApi.getSection(sectionCode),
    staleTime: 60_000,
  })

  const handleLike = useCallback(
    async (t: RecommendTemplate) => {
      if (!isLoggedIn) {
        setShowLoginModal(true)
        return
      }
      try {
        const res = await templateApi.like(t.id)
        setLikedMap((prev) => ({
          ...prev,
          [t.id]: { liked: res.liked, likeCount: res.likeCount },
        }))
      } catch (e) {
        alert(e instanceof Error ? e.message : '操作失败')
      }
    },
    [isLoggedIn, setShowLoginModal],
  )

  const handleReferenceGenerate = useCallback(
    async (t: RecommendTemplate) => {
      setGeneratingId(t.id)
      try {
        await templateApi.view(t.id)
        const result = await templateApi.referenceGenerate(t.id)
        onReferenceResult?.(result)
      } catch (e) {
        alert(e instanceof Error ? e.message : '参考生图失败')
      } finally {
        setGeneratingId(null)
      }
    },
    [onReferenceResult],
  )

  const handleUse = useCallback(
    (t: RecommendTemplate) => {
      templateApi.view(t.id).catch(() => {})
      onUseTemplate?.(t)
    },
    [onUseTemplate],
  )

  const scrollNext = () => {
    scrollRef.current?.scrollBy({ left: 360, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <section className="topic-section mb-10">
        <div className="topic-section__inner animate-pulse">
          <div className="mb-4 h-6 w-24 rounded bg-gray-200" />
          <div className="flex gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[220px] w-[160px] shrink-0 rounded-xl bg-gray-200" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!section?.cards?.length) return null

  return (
    <section className="topic-section mb-10">
      <div className="topic-section__inner">
        <div className="mb-4 flex items-end justify-between px-1">
          <div>
            <h2 className="text-lg font-semibold text-ckt-text">{section.title}</h2>
            {section.subtitle && (
              <p className="mt-0.5 text-xs text-ckt-text-secondary">{section.subtitle}</p>
            )}
          </div>
          <button
            type="button"
            className="flex shrink-0 items-center gap-0.5 text-xs text-ckt-text-secondary transition hover:text-ckt-primary"
          >
            更多 <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="topic-section__scroll-wrap">
          <div ref={scrollRef} className="topic-section__scroll scrollbar-none">
            {section.cards.map((card, index) => {
              const template = {
                ...toRecommendTemplate(card),
                ...likedMap[card.templateId],
              }
              return (
              <RecommendTemplateCard
                key={card.id}
                template={template}
                badge={index === 0 ? 'NEW' : undefined}
                hideTitle
                onUse={handleUse}
                onLike={handleLike}
                onReferenceGenerate={handleReferenceGenerate}
                generating={generatingId === card.templateId}
              />
              )
            })}
          </div>
          {section.cards.length > 4 && (
            <button
              type="button"
              onClick={scrollNext}
              className="topic-section__next"
              aria-label="下一组"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
