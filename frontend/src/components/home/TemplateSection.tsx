import { ChevronRight } from '@/components/layout/LayoutParts'
import type { DesignTemplate } from '@/types'
import { TemplateCard } from './TemplateCard'

interface Props {
  title: string
  subtitle?: string
  templates: DesignTemplate[]
  columns?: 4 | 5 | 6
  aspect?: 'portrait' | 'landscape' | 'square'
  showPlay?: boolean
  onTemplateClick?: (t: DesignTemplate) => void
}

export function TemplateSection({
  title,
  subtitle,
  templates,
  columns = 6,
  aspect = 'portrait',
  showPlay,
  onTemplateClick,
}: Props) {
  if (!templates.length) return null

  const colClass =
    columns === 4
      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      : columns === 5
        ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
        : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ckt-text">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-ckt-text-secondary">{subtitle}</p>}
        </div>
        <button className="flex shrink-0 items-center gap-0.5 text-xs text-ckt-text-secondary transition hover:text-ckt-primary">
          更多 <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className={`grid gap-3 ${colClass}`}>
        {templates.map((t, i) => (
          <TemplateCard
            key={t.id}
            template={t}
            aspect={aspect}
            showPlay={showPlay}
            badge={t.isHot ? 'HOT' : i === 0 ? 'NEW' : undefined}
            onClick={() => onTemplateClick?.(t)}
          />
        ))}
      </div>
    </section>
  )
}
