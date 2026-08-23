import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLiveDate } from '@/hooks/useLiveDate'
import type { CalendarCategory, CalendarEvent, CalendarToday } from '@/types'
import { computeTodayInfo, enrichCalendarEvents } from '@/utils/calendar'
import { cn } from '@/utils'

interface Props {
  categories: CalendarCategory[]
  today: CalendarToday
  events: CalendarEvent[]
  selectedCategories: string[]
  selectedEventId: number | null
  onToggleCategory: (code: string) => void
  onSelectEvent: (id: number) => void
}

function CategoryCheckbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: () => void
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-1.5">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={cn(
          'flex h-[14px] w-[14px] items-center justify-center rounded-[2px] border transition-colors',
          checked ? 'border-[#1677ff] bg-[#1677ff]' : 'border-[#c9cdd4] bg-white',
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-white" fill="none">
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="text-[13px] leading-none text-[#646a73]">{label}</span>
    </label>
  )
}

export function HotspotCalendarPanel({
  categories,
  today: _today,
  events,
  selectedCategories,
  selectedEventId,
  onToggleCategory,
  onSelectEvent,
}: Props) {
  const now = useLiveDate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const today = useMemo(() => computeTodayInfo(now), [now])
  const liveEvents = useMemo(() => enrichCalendarEvents(events, now), [events, now])

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return

    el.addEventListener('scroll', updateScrollState, { passive: true })
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)

    return () => {
      el.removeEventListener('scroll', updateScrollState)
      ro.disconnect()
    }
  }, [liveEvents, updateScrollState])

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -260, behavior: 'smooth' })
  }

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 260, behavior: 'smooth' })
  }

  return (
    <section className="border-b border-[#eef0f3] bg-white pb-5 pt-6">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* 标题 + 筛选 + 今天 */}
        <div className="mb-4 flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="mb-3 text-[20px] font-semibold leading-none text-[#1f2329]">热点日历</h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
              {categories.map((cat) => (
                <CategoryCheckbox
                  key={cat.code}
                  checked={selectedCategories.includes(cat.code)}
                  label={cat.name}
                  onChange={() => onToggleCategory(cat.code)}
                />
              ))}
            </div>
          </div>

          {/* 今天日期卡片 */}
          <div className="flex shrink-0 items-center gap-3 rounded-lg border border-[#eef0f3] bg-white px-4 py-2.5">
            <div className="text-[42px] font-semibold leading-none tracking-tight text-[#1f2329]">
              {today.day}
            </div>
            <div className="text-[12px] leading-[18px] text-[#8f959e]">
              <div className="text-[#646a73]">{today.yearMonth}</div>
              <div>
                {today.weekday} · {today.lunarDate}
              </div>
            </div>
            <span className="rounded bg-[#fff1f0] px-1.5 py-0.5 text-[12px] font-medium leading-[18px] text-[#ff4d4f]">
              今天
            </span>
          </div>
        </div>

        {/* 事件卡片横向滚动 */}
        <div className="relative">
          <div
            ref={scrollRef}
            className={cn(
              'scrollbar-none flex gap-3 overflow-x-auto pb-0.5',
              canScrollLeft && 'pl-10',
              canScrollRight && 'pr-10',
            )}
          >
            {liveEvents.map((ev) => {
              const selected = selectedEventId === ev.id
              const urgent = ev.daysLeft <= 7
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => onSelectEvent(ev.id)}
                  className={cn(
                    'flex h-[72px] w-[220px] shrink-0 items-center justify-between rounded-lg border bg-white px-4 text-left transition-shadow',
                    selected
                      ? 'border-[#1677ff] shadow-[0_0_0_1px_#1677ff]'
                      : 'border-[#e8eaed] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
                  )}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="truncate text-[14px] font-semibold leading-[20px] text-[#1f2329]">
                      {ev.name}
                    </div>
                    <div className="mt-0.5 truncate text-[12px] leading-[18px] text-[#8f959e]">
                      {ev.dateLabel} {ev.weekday}
                    </div>
                  </div>
                  <div
                    className={cn(
                      'flex h-[54px] w-[46px] shrink-0 flex-col items-center justify-center rounded-md',
                      urgent ? 'bg-[#fff1f0] text-[#ff4d4f]' : 'bg-[#e6f4ff] text-[#1677ff]',
                    )}
                  >
                    <span className="text-[20px] font-semibold leading-none">{ev.daysLeft}</span>
                    <span className="mt-1 text-[11px] leading-none">天后</span>
                  </div>
                </button>
              )
            })}
          </div>

          {canScrollLeft && (
            <>
              <div
                className="pointer-events-none absolute left-8 top-0 h-full w-16 bg-gradient-to-r from-white to-transparent"
                aria-hidden
              />
              <button
                type="button"
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#eef0f3] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
                aria-label="向左滚动"
              >
                <ChevronLeft className="h-4 w-4 text-[#646a73]" />
              </button>
            </>
          )}

          {canScrollRight && (
            <>
              <div
                className="pointer-events-none absolute right-8 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent"
                aria-hidden
              />
              <button
                type="button"
                onClick={scrollRight}
                className="absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#eef0f3] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
                aria-label="向右滚动"
              >
                <ChevronRight className="h-4 w-4 text-[#646a73]" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
