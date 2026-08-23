import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { ChevronRight } from '@/components/layout/LayoutParts'
import { homeApi } from '@/api'
import { useAuth } from '@/context/AuthContext'
import type { UserDesign } from '@/types'
import { coverFallback } from '@/utils'

interface Props {
  onCreate?: () => void
  onOpen?: (design: UserDesign) => void
}

export function RecentDesignsSection({ onCreate, onOpen }: Props) {
  const { isLoggedIn } = useAuth()

  const { data: designs, isLoading } = useQuery({
    queryKey: ['recentDesigns', isLoggedIn],
    queryFn: () => homeApi.getRecentDesigns(12),
    staleTime: 30_000,
  })

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-lg font-semibold text-ckt-text">最近设计</h2>
        <button
          type="button"
          className="flex shrink-0 items-center gap-0.5 text-xs text-ckt-text-secondary transition hover:text-ckt-primary"
        >
          更多 <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="recent-designs-scroll flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={onCreate}
          className="recent-design-card group flex h-[132px] w-[200px] shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#dce3ed] bg-[#f8fafc] transition hover:border-ckt-primary/50 hover:bg-blue-50/40"
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <Plus className="h-5 w-5 text-ckt-primary" />
          </div>
          <span className="text-xs text-ckt-text-secondary group-hover:text-ckt-primary">创建设计</span>
        </button>

        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[132px] w-[200px] shrink-0 animate-pulse rounded-xl bg-gray-100"
              />
            ))
          : designs?.map((design) => (
              <button
                key={design.id}
                type="button"
                onClick={() => onOpen?.(design)}
                className="recent-design-card group relative h-[132px] w-[200px] shrink-0 overflow-hidden rounded-xl bg-gray-100 text-left transition hover:shadow-md"
              >
                <img
                  src={design.coverUrl || coverFallback(`design-${design.id}`, 400, 264)}
                  alt={design.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-2.5 pb-2 pt-6 opacity-0 transition group-hover:opacity-100">
                  <p className="truncate text-xs font-medium text-white">{design.title}</p>
                </div>
              </button>
            ))}
      </div>
    </section>
  )
}
