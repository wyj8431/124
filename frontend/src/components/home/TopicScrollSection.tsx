import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from '@/components/layout/LayoutParts'
import { homeApi } from '@/api'
import type { DesignTemplate, HomeSectionCard } from '@/types'
import { coverFallback, featureCover } from '@/utils'

interface Props {
  sectionCode: string
  onTemplateClick?: (template: DesignTemplate) => void
}

function TopicCard({
  card,
  index,
  onClick,
}: {
  card: HomeSectionCard
  index: number
  onClick?: () => void
}) {
  const [failed, setFailed] = useState(false)

  return (
    <button type="button" onClick={onClick} className="topic-card group shrink-0">
      <div className="topic-card__poster">
        {failed ? (
          <div
            className="topic-card__fallback"
            style={{ background: featureCover(card.label, index) }}
          />
        ) : (
          <img
            src={card.coverUrl || coverFallback(`topic-${card.templateId}`, 200, 280)}
            alt={card.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <div className="topic-card__label">{card.label}</div>
    </button>
  )
}

export function TopicScrollSection({ sectionCode, onTemplateClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: section, isLoading } = useQuery({
    queryKey: ['homeSection', sectionCode],
    queryFn: () => homeApi.getSection(sectionCode),
    staleTime: 60_000,
  })

  const scrollNext = () => {
    scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <section className="topic-section mb-10">
        <div className="topic-section__inner animate-pulse">
          <div className="mb-4 h-6 w-24 rounded bg-gray-200" />
          <div className="flex gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[220px] w-[140px] shrink-0 rounded-xl bg-gray-200" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!section?.cards?.length) return null

  const toTemplate = (card: HomeSectionCard): DesignTemplate => ({
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
  })

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
            {section.cards.map((card, index) => (
              <TopicCard
                key={card.id}
                card={card}
                index={index}
                onClick={() => onTemplateClick?.(toTemplate(card))}
              />
            ))}
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
