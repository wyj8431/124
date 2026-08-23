import { useEffect, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { DesignTemplate } from '@/types'
import { coverFallback } from '@/utils'
import { cn } from '@/utils'
import {
  CALENDAR_SCENE_TABS,
  filterCalendarTemplates,
} from '@/components/calendar/calendarTemplateFilters'

interface Props {
  templates: DesignTemplate[]
  eventId?: number | null
  eventName?: string
  searchKeyword?: string
  loading?: boolean
  onTemplateClick?: (t: DesignTemplate) => void
}

function uniqueTemplates(templates: DesignTemplate[]) {
  const seen = new Set<string>()
  return templates.filter((t) => {
    const key = (t.coverUrl || `id-${t.id}`).toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function MasonryCard({ template, onClick }: { template: DesignTemplate; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full overflow-hidden rounded-lg bg-white text-left transition hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
    >
      <div
        className="relative w-full overflow-hidden bg-[#f5f7fa]"
        style={{ aspectRatio: `${template.width} / ${template.height}` }}
      >
        <img
          src={template.coverUrl || coverFallback(template.id)}
          alt={template.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
    </button>
  )
}

function GallerySkeleton() {
  const heights = [320, 280, 360, 240, 300, 340, 260, 380, 290, 350, 270, 310, 330, 250, 370]
  return (
    <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5">
      {heights.map((h, i) => (
        <div key={i} className="mb-4 break-inside-avoid">
          <div className="animate-pulse rounded-lg bg-[#eef0f3]" style={{ height: h }} />
        </div>
      ))}
    </div>
  )
}

export function CalendarTemplateGallery({
  templates,
  eventId,
  eventName,
  searchKeyword = '',
  loading,
  onTemplateClick,
}: Props) {
  const [activeTab, setActiveTab] = useState('recommend')

  useEffect(() => {
    setActiveTab('recommend')
  }, [eventId, eventName])

  const uniqueList = useMemo(() => uniqueTemplates(templates), [templates])

  const filteredTemplates = useMemo(
    () => filterCalendarTemplates(uniqueList, activeTab),
    [uniqueList, activeTab],
  )

  return (
    <div>
      {eventName && (
        <p className="mb-4 text-[13px] text-[#646a73]">
          {searchKeyword.trim()
            ? `在「${eventName}」中搜索「${searchKeyword.trim()}」，找到 ${filteredTemplates.length} 个模板`
            : `为「${eventName}」推荐 ${filteredTemplates.length} 个模板`}
        </p>
      )}
      {/* 方案 A：官方 Pill 分类栏 + 5 列瀑布流 */}
      <div className="mb-5 flex items-center gap-3">
        <div className="scrollbar-none flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {CALENDAR_SCENE_TABS.map((tab) => {
            const active = activeTab === tab.code
            return (
              <button
                key={tab.code}
                type="button"
                onClick={() => setActiveTab(tab.code)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-1.5 text-[13px] leading-none transition-colors',
                  active
                    ? 'bg-[#1677ff] font-medium text-white'
                    : 'bg-[#f2f3f5] text-[#1f2329] hover:bg-[#e8eaed]',
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          className="flex shrink-0 items-center gap-0.5 text-[13px] text-[#646a73] transition hover:text-[#1677ff]"
          aria-label="更多分类"
        >
          更多
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 5 列瀑布流 */}
      {loading && !templates.length ? (
        <GallerySkeleton />
      ) : filteredTemplates.length ? (
        <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5">
          {filteredTemplates.map((t) => (
            <div key={t.id} className="mb-4 break-inside-avoid">
              <MasonryCard template={t} onClick={() => onTemplateClick?.(t)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[200px] items-center justify-center text-sm text-[#8f959e]">
          {searchKeyword.trim() ? `未找到与「${searchKeyword.trim()}」相关的模板` : '该分类暂无模板'}
        </div>
      )}
    </div>
  )
}
