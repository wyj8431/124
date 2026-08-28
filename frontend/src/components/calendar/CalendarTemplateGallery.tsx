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
  officialTotalCount?: number
  searchKeyword?: string
  loading?: boolean
  onTemplateClick?: (t: DesignTemplate) => void
}

const PAGE_SIZE = 32

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
      className="group w-full overflow-hidden rounded-[8px] bg-white text-left transition hover:shadow-[0_4px_14px_rgba(24,38,61,0.14)]"
    >
      <div
        className="relative w-full overflow-hidden bg-[#f5f7fa]"
        style={{ aspectRatio: `${template.width} / ${template.height}` }}
      >
        <img
          src={template.coverUrl || coverFallback(template.id)}
          alt={template.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.015]"
          loading="lazy"
        />
      </div>
    </button>
  )
}

function GallerySkeleton() {
  const heights = [320, 280, 360, 240, 300, 340, 260, 380, 290, 350, 270, 310, 330, 250, 370]
  return (
    <div className="columns-2 gap-3 sm:columns-3 md:columns-4 xl:columns-6 2xl:columns-6">
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
  officialTotalCount,
  searchKeyword = '',
  loading,
  onTemplateClick,
}: Props) {
  const [activeTab, setActiveTab] = useState('recommend')
  const [currentPage, setCurrentPage] = useState(1)
  const [jumpPage, setJumpPage] = useState('1')

  useEffect(() => {
    setActiveTab('recommend')
  }, [eventId, eventName])

  useEffect(() => {
    setCurrentPage(1)
    setJumpPage('1')
  }, [eventId, eventName, activeTab, searchKeyword])

  const uniqueList = useMemo(() => uniqueTemplates(templates), [templates])

  const filteredTemplates = useMemo(
    () => filterCalendarTemplates(uniqueList, activeTab),
    [uniqueList, activeTab],
  )

  const pageCount = Math.max(1, Math.ceil(filteredTemplates.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, pageCount)
  const pagedTemplates = useMemo(
    () => filteredTemplates.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredTemplates, safePage],
  )

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount)
      setJumpPage(String(pageCount))
    }
  }, [currentPage, pageCount])

  const selectPage = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, pageCount))
    setCurrentPage(nextPage)
    setJumpPage(String(nextPage))
    window.setTimeout(() => {
      document.getElementById('event-templates')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  const confirmJump = () => {
    const page = Number.parseInt(jumpPage, 10)
    if (Number.isFinite(page)) selectPage(page)
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3 border-t border-[#eef0f3] pt-5">
        <div className="scrollbar-none flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {CALENDAR_SCENE_TABS.map((tab) => {
            const active = activeTab === tab.code
            return (
              <button
                key={tab.code}
                type="button"
                onClick={() => setActiveTab(tab.code)}
                className={cn(
                  'shrink-0 rounded-[7px] px-3 py-2 text-[13px] leading-none transition-colors',
                  active
                    ? 'bg-[#1677ff] font-medium text-white'
                    : 'bg-[#f3f5f9] text-[#505a71] hover:bg-[#e8edf5]',
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

      <div className="mb-4 flex items-center justify-between text-[13px] text-[#8d96a8]">
        <span>{eventName ? `${eventName}模板` : '热门模板'}</span>
        <span>
          {searchKeyword.trim()
            ? `搜索“${searchKeyword.trim()}” · ${filteredTemplates.length} 个`
            : `共 ${officialTotalCount ?? filteredTemplates.length} 个`}
        </span>
      </div>

      {loading && !templates.length ? (
        <GallerySkeleton />
      ) : filteredTemplates.length ? (
        <>
          <div className="columns-2 gap-3 sm:columns-3 md:columns-4 xl:columns-6 2xl:columns-6">
            {pagedTemplates.map((t) => (
              <div key={t.id} className="mb-3 break-inside-avoid">
                <MasonryCard template={t} onClick={() => onTemplateClick?.(t)} />
              </div>
            ))}
          </div>
          {pageCount > 1 && (
            <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="模板分页">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => selectPage(safePage - 1)}
                className="calendar-pagination__button calendar-pagination__button--wide disabled:cursor-not-allowed disabled:opacity-45"
              >
                上一页
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  aria-current={page === safePage ? 'page' : undefined}
                  onClick={() => selectPage(page)}
                  className={cn(
                    'calendar-pagination__button',
                    page === safePage && 'calendar-pagination__button--active',
                  )}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                disabled={safePage === pageCount}
                onClick={() => selectPage(safePage + 1)}
                className="calendar-pagination__button calendar-pagination__button--wide disabled:cursor-not-allowed disabled:opacity-45"
              >
                下一页
              </button>
              <span className="calendar-pagination__jump-label">到第</span>
              <input
                value={jumpPage}
                onChange={(event) => setJumpPage(event.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') confirmJump()
                }}
                inputMode="numeric"
                aria-label="页码"
                className="calendar-pagination__input"
              />
              <span className="calendar-pagination__jump-label">页</span>
              <button type="button" onClick={confirmJump} className="calendar-pagination__button calendar-pagination__button--wide">
                确定
              </button>
            </nav>
          )}
        </>
      ) : (
        <div className="flex min-h-[200px] items-center justify-center text-sm text-[#8f959e]">
          {searchKeyword.trim() ? `未找到与「${searchKeyword.trim()}」相关的模板` : '该分类暂无模板'}
        </div>
      )}

    </div>
  )
}
