import { ChevronRight } from '@/components/layout/LayoutParts'
import type { CalendarEvent, DesignTemplate } from '@/types'
import { coverFallback, formatDate } from '@/utils'

interface Props {
  events: CalendarEvent[]
  templates: DesignTemplate[]
}

export function CalendarSection({ events, templates }: Props) {
  const qixiTemplates = templates.filter((t) => t.tags?.includes('七夕')).slice(0, 6)

  return (
    <section className="mb-10 px-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ckt-text">热点日历</h2>
        <button className="flex items-center gap-0.5 text-xs text-ckt-text-secondary hover:text-ckt-primary">
          更多 <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 日历事件条 */}
      <div className="mb-5 flex gap-3 overflow-x-auto pb-2">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="flex min-w-[140px] shrink-0 cursor-pointer flex-col rounded-xl border border-ckt-border bg-white p-3 transition hover:border-ckt-primary hover:shadow-sm"
          >
            <div className="text-sm font-semibold text-ckt-text">{ev.name}</div>
            <div className="mt-0.5 text-[11px] text-ckt-text-secondary">
              {formatDate(ev.eventDate)}
            </div>
            <div className="mt-2 text-lg font-bold text-ckt-primary">
              {ev.daysLeft}
              <span className="ml-0.5 text-xs font-normal text-ckt-text-secondary">天后</span>
            </div>
          </div>
        ))}
      </div>

      {/* 关联模板 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {qixiTemplates.map((t) => (
          <div key={t.id} className="group cursor-pointer overflow-hidden rounded-xl bg-white transition hover:shadow-lg">
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={t.coverUrl || coverFallback(t.id)}
                alt={t.title}
                className="h-full w-full object-cover transition group-hover:scale-105"
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
