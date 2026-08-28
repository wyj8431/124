import { ChevronRight } from '@/components/layout/LayoutParts'
import type { RecommendTemplate } from '@/types'
import { coverFallback } from '@/utils'

interface HomeRecommendRowSectionProps {
  templates: RecommendTemplate[]
  onUseTemplate: (template: RecommendTemplate) => void
  onMore: () => void
}

export function HomeRecommendRowSection({
  templates,
  onUseTemplate,
  onMore,
}: HomeRecommendRowSectionProps) {
  const visibleTemplates = templates.slice(0, 7)

  if (!visibleTemplates.length) return null

  return (
    <section className="home-recommend-row" aria-labelledby="home-recommend-row-title">
      <div className="home-recommend-row__head">
        <h2 id="home-recommend-row-title">为你推荐</h2>
        <button type="button" onClick={onMore}>
          更多 <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="home-recommend-row__list">
        {visibleTemplates.map((template) => (
          <button
            key={template.id}
            type="button"
            className="home-recommend-row__card"
            onClick={() => onUseTemplate(template)}
            aria-label={`使用模板：${template.title}`}
          >
            <img
              src={template.coverUrl || coverFallback(`home-recommend-${template.id}`, 480, 720)}
              alt={template.title}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.onerror = null
                event.currentTarget.src = coverFallback(`home-recommend-${template.id}`, 480, 720)
              }}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
