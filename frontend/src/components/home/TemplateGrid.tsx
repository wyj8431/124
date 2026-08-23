import { ChevronRight } from '@/components/layout/LayoutParts'
import type { DesignTemplate } from '@/types'
import { coverFallback } from '@/utils'

interface Props {
  title: string
  templates: DesignTemplate[]
  showMore?: boolean
  onTemplateClick?: (t: DesignTemplate) => void
}

export function TemplateGrid({ title, templates, showMore = true, onTemplateClick }: Props) {
  if (!templates.length) return null

  return (
    <section className="mb-10 px-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ckt-text">{title}</h2>
        {showMore && (
          <button className="flex items-center gap-0.5 text-xs text-ckt-text-secondary hover:text-ckt-primary">
            更多 <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {templates.map((t) => (
          <div
            key={t.id}
            onClick={() => onTemplateClick?.(t)}
            className="group cursor-pointer overflow-hidden rounded-xl bg-white transition hover:shadow-lg"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={t.coverUrl || coverFallback(t.id)}
                alt={t.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
            </div>
            <div className="truncate px-2 py-2 text-xs text-ckt-text-secondary">{t.title}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
