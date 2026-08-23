import { useState } from 'react'
import type { DesignTemplate, TemplateCategory } from '@/types'
import { TemplateCard } from './TemplateCard'

interface Props {
  categories: TemplateCategory[]
  templates: DesignTemplate[]
  activeCategory: string
  onCategoryChange: (code: string) => void
  onTemplateClick?: (t: DesignTemplate) => void
}

export function MasonryFeed({
  categories,
  templates,
  activeCategory,
  onCategoryChange,
  onTemplateClick,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const visibleCats = expanded ? categories : categories.slice(0, 16)

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold text-ckt-text">大家都在搜</h2>

      <div className="mb-5 flex flex-wrap gap-2">
        {visibleCats.map((cat) => (
          <button
            key={cat.code}
            onClick={() => onCategoryChange(cat.code)}
            className={`rounded-full px-3.5 py-1.5 text-xs transition ${
              activeCategory === cat.code
                ? 'bg-ckt-primary text-white'
                : 'bg-gray-100 text-ckt-text-secondary hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
        {!expanded && categories.length > 16 && (
          <button
            onClick={() => setExpanded(true)}
            className="rounded-full px-3 py-1.5 text-xs text-ckt-text-secondary hover:text-ckt-primary"
          >
            ···
          </button>
        )}
      </div>

      <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6">
        {templates.map((t, i) => (
          <div key={t.id} className="mb-3 break-inside-avoid">
            <TemplateCard
              template={t}
              aspect={i % 3 === 0 ? 'landscape' : 'portrait'}
              badge={t.isFree === 1 && i % 5 === 0 ? 'FREE' : undefined}
              onClick={() => onTemplateClick?.(t)}
            />
          </div>
        ))}
      </div>

      <div className="py-10 text-center text-xs text-gray-400">- 到底了 -</div>
    </section>
  )
}
