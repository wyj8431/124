import { ChevronRight } from '@/components/layout/LayoutParts'
import type { EditorCollection } from '@/types'
import { coverFallback } from '@/utils'

interface Props {
  collections: EditorCollection[]
}

export function CategoryQuickLinks({ collections }: Props) {
  return (
    <section className="mb-10">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {collections.slice(0, 6).map((item) => (
          <button
            key={item.id}
            className="group overflow-hidden rounded-xl border border-gray-100 bg-white transition hover:border-blue-100 hover:shadow-md"
          >
            <div className="aspect-[4/3] overflow-hidden bg-gray-50">
              <img
                src={item.coverUrl || coverFallback(`col-${item.id}`, 320, 240)}
                alt={item.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-medium text-ckt-text">{item.title}</p>
                <p className="truncate text-[11px] text-ckt-text-secondary">{item.subtitle}</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300 group-hover:text-ckt-primary" />
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
