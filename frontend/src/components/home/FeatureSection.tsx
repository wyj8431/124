import { useRef } from 'react'
import { ChevronRight } from '@/components/layout/LayoutParts'
import type { HomeTab, HomeFeature } from '@/types'
import { featureCover } from '@/utils'

interface Props {
  homeTabs: HomeTab[]
  featureCards: HomeFeature[]
  activeTab: string
  onTabChange: (code: string) => void
  loading?: boolean
}

export function FeatureSection({ homeTabs, featureCards, activeTab, onTabChange, loading }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' })
  }

  return (
    <section className="mb-10 px-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {homeTabs.map((tab) => (
            <button
              key={tab.code}
              onClick={() => onTabChange(tab.code)}
              className={`relative pb-2 text-sm transition ${
                activeTab === tab.code
                  ? 'font-semibold text-ckt-text after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-5 after:-translate-x-1/2 after:rounded-full after:bg-ckt-primary'
                  : 'text-ckt-text-secondary hover:text-ckt-text'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-0.5 text-xs text-ckt-text-secondary hover:text-ckt-primary">
          更多 <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[120px] w-[180px] shrink-0 animate-pulse rounded-xl bg-gray-100" />
              ))
            : featureCards.map((card, i) => (
                <div
                  key={card.id}
                  className="group relative h-[120px] w-[180px] shrink-0 cursor-pointer overflow-hidden rounded-xl transition hover:shadow-md"
                  style={{ background: featureCover(card.title, i) }}
                >
                  <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/5" />
                  <div className="relative flex h-full flex-col justify-end p-3">
                    <div className="text-sm font-semibold text-white drop-shadow">{card.title}</div>
                    <div className="text-[11px] text-white/90">{card.subtitle}</div>
                  </div>
                </div>
              ))}
        </div>
        <button
          onClick={() => scroll('right')}
          className="absolute -right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition hover:shadow-lg"
        >
          <ChevronRight className="h-4 w-4 text-ckt-text-secondary" />
        </button>
      </div>
    </section>
  )
}
