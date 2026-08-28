import { useState } from 'react'
import { ChevronRight } from '@/components/layout/LayoutParts'
import type { DesignScene, HomeTab, HomeFeature } from '@/types'
import { coverFallback } from '@/utils'

interface Props {
  quickStartScenes: DesignScene[]
  tabs: HomeTab[]
  cards: HomeFeature[]
  activeTab: string
  onTabChange: (code: string) => void
  loading?: boolean
  onSceneClick: (sceneId: number) => void
  onFeatureClick: (feature: HomeFeature) => void
}

function CoverImage({ src, alt, seed }: { src?: string; alt: string; seed: string }) {
  const [failed, setFailed] = useState(false)
  const resolved = !failed && src ? src : coverFallback(seed, 160, 120)

  return (
    <img
      src={resolved}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
      loading="lazy"
    />
  )
}

export function QuickStartPanel({
  quickStartScenes,
  tabs,
  cards,
  activeTab,
  onTabChange,
  loading,
  onSceneClick,
  onFeatureClick,
}: Props) {
  const [page, setPage] = useState(0)
  const createScene = quickStartScenes.find((s) => s.code === 'create') ?? quickStartScenes[0]
  const subScenes = quickStartScenes.filter((s) => s.code !== 'create').slice(0, 2)

  const pageSize = 8
  const totalPages = Math.max(1, Math.ceil(cards.length / pageSize))
  const visibleCards = cards.slice(page * pageSize, page * pageSize + pageSize)

  const handleTabChange = (code: string) => {
    setPage(0)
    onTabChange(code)
  }

  return (
    <section className="mb-10 rounded-3xl bg-[#f4f7fb] p-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,34%)_1fr]">
        {/* 左侧：快速开始 */}
        <div className="flex flex-col gap-3">
          {createScene && (
            <button
              type="button"
              onClick={() => onSceneClick(createScene.id)}
              className="group flex min-h-[168px] cursor-pointer items-stretch justify-between rounded-2xl bg-white p-5 text-left transition hover:shadow-md"
            >
              <div className="flex flex-col justify-between py-0.5">
                <div>
                  <div className="text-base font-semibold text-ckt-text">{createScene.name}</div>
                  <div className="mt-1 text-xs text-ckt-text-secondary">
                    {createScene.subtitle ?? '高频创作场景一键直达'}
                  </div>
                </div>
                <span className="mt-4 inline-flex items-center gap-0.5 text-xs font-medium text-ckt-primary">
                  立即体验 <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="ml-3 flex shrink-0 items-end">
                <div className="flex h-[88px] w-[88px] items-center justify-center rounded-xl border-2 border-dashed border-ckt-primary/35 bg-blue-50/50 transition group-hover:border-ckt-primary/60">
                  <span className="text-3xl font-light text-ckt-primary">+</span>
                </div>
              </div>
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            {subScenes.map((scene) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => onSceneClick(scene.id)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white text-left transition hover:shadow-md"
              >
                <div className="flex flex-1 flex-col p-4 pb-2">
                  <div className="text-sm font-semibold text-ckt-text">{scene.name}</div>
                  <div className="mt-0.5 line-clamp-2 text-[11px] text-ckt-text-secondary">
                    {scene.subtitle ?? '点击即可快速开始'}
                  </div>
                </div>
                <div className="h-[72px] overflow-hidden px-4 pb-3">
                  <div className="h-full overflow-hidden rounded-lg bg-gray-50">
                    <CoverImage
                      src={scene.previewUrl}
                      alt={scene.name}
                      seed={`scene-${scene.code}`}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 右侧：Tab + 功能卡片 */}
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto border-b border-gray-200/80 pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.code}
                  type="button"
                  onClick={() => handleTabChange(tab.code)}
                  className={`shrink-0 whitespace-nowrap pb-2 text-sm transition ${
                    activeTab === tab.code
                      ? 'font-semibold text-ckt-text after:block after:h-0.5 after:w-5 after:rounded-full after:bg-ckt-primary'
                      : 'text-ckt-text-secondary hover:text-ckt-text'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="flex shrink-0 items-center gap-0.5 text-xs text-ckt-text-secondary hover:text-ckt-primary"
            >
              更多 <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-[108px] animate-pulse rounded-xl bg-white/80" />
                  ))
                : visibleCards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => onFeatureClick(card)}
                      className="group flex h-[108px] cursor-pointer items-center justify-between overflow-hidden rounded-xl bg-white px-4 text-left transition hover:shadow-md"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="truncate text-sm font-semibold text-ckt-text">
                          {card.title}
                        </div>
                        <div className="mt-0.5 truncate text-[11px] text-ckt-text-secondary">
                          {card.subtitle}
                        </div>
                      </div>
                      <div className="h-[72px] w-[88px] shrink-0 overflow-hidden rounded-lg bg-gray-50">
                        <CoverImage
                          src={card.coverUrl}
                          alt={card.title}
                          seed={`feature-${card.id}`}
                        />
                      </div>
                    </button>
                  ))}
            </div>

            {totalPages > 1 && (
              <button
                type="button"
                onClick={() => setPage((p) => (p + 1) % totalPages)}
                className="absolute -right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition hover:shadow-lg"
                aria-label="下一组"
              >
                <ChevronRight className="h-4 w-4 text-ckt-text-secondary" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
