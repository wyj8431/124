import type { HomeSection } from '@/types'
import { ChevronRight } from '@/components/layout/LayoutParts'

interface Props {
  section: HomeSection
  onTemplateClick?: (id: number) => void
}

export function SectionBlock({ section, onTemplateClick }: Props) {
  return (
    <section className="mb-10 px-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ckt-text">{section.title}</h2>
          {section.subtitle && (
            <p className="mt-0.5 text-xs text-ckt-text-secondary">{section.subtitle}</p>
          )}
        </div>
        <button className="flex items-center gap-0.5 text-xs text-ckt-text-secondary hover:text-ckt-primary">
          更多 <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {section.templates.map((t) => (
          <div
            key={t.id}
            onClick={() => onTemplateClick?.(t.id)}
            className="group cursor-pointer overflow-hidden rounded-xl bg-white transition hover:shadow-lg"
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={t.coverUrl}
                alt={t.title}
                className="h-full w-full object-cover transition group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="truncate px-2 py-2 text-xs text-ckt-text-secondary">{t.title}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
