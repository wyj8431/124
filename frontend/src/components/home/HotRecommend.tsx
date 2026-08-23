import { ChevronRight } from '@/components/layout/LayoutParts'
import type { HomeTab, HomeFeature } from '@/types'
import { featureCover } from '@/utils'

interface Props {
  tabs: HomeTab[]
  cards: HomeFeature[]
  activeTab: string
  onTabChange: (code: string) => void
  loading?: boolean
}

export function HotRecommend({ tabs, cards, activeTab, onTabChange, loading }: Props) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ckt-text">热门推荐</h2>
        <button className="flex items-center gap-0.5 text-xs text-ckt-text-secondary hover:text-ckt-primary">
          更多 <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4 border-b border-gray-100 pb-2">
        {tabs.slice(0, 7).map((tab) => (
          <button
            key={tab.code}
            onClick={() => onTabChange(tab.code)}
            className={`relative pb-2 text-sm transition ${
              activeTab === tab.code
                ? 'font-medium text-ckt-text after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-5 after:-translate-x-1/2 after:rounded-full after:bg-ckt-primary'
                : 'text-ckt-text-secondary hover:text-ckt-text'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-gray-100" />
            ))
          : cards.slice(0, 8).map((card, i) => (
              <div
                key={card.id}
                className="group cursor-pointer overflow-hidden rounded-xl transition hover:shadow-md"
                style={{ background: featureCover(card.title, i) }}
              >
                <div className="flex aspect-[4/3] flex-col justify-end p-4">
                  <div className="text-sm font-semibold text-white drop-shadow">{card.title}</div>
                  <div className="text-[11px] text-white/85">{card.subtitle}</div>
                </div>
              </div>
            ))}
      </div>
    </section>
  )
}
