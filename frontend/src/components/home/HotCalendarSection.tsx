import { useNavigate } from 'react-router-dom'
import { ChevronRight } from '@/components/layout/LayoutParts'
import type { CalendarEvent } from '@/types'
import { formatDate } from '@/utils'

interface Props {
  events: CalendarEvent[]
}

export function HotCalendarSection({ events }: Props) {
  const navigate = useNavigate()

  if (!events.length) return null

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-lg font-semibold text-ckt-text">热点日历</h2>
        <button
          type="button"
          onClick={() => navigate('/calendar')}
          className="flex shrink-0 items-center gap-0.5 text-xs text-ckt-text-secondary transition hover:text-ckt-primary"
        >
          更多 <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {events.map((ev) => (
          <button
            key={ev.id}
            type="button"
            onClick={() => navigate(`/calendar?eventId=${ev.id}`)}
            className="flex min-w-[168px] shrink-0 items-center justify-between gap-3 rounded-xl border border-ckt-border bg-white px-4 py-3 text-left transition hover:border-ckt-primary/30 hover:shadow-sm"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-ckt-text">{ev.name}</div>
              <div className="mt-0.5 text-[11px] text-ckt-text-secondary">
                {formatDate(ev.eventDate)}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-center rounded-lg bg-[#fff1f0] px-2.5 py-1.5">
              <span className="text-base font-bold leading-none text-[#ff4d4f]">{ev.daysLeft}</span>
              <span className="mt-0.5 text-[10px] text-[#ff7875]">天后</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
