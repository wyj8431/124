import { useState, useRef, useCallback } from 'react'
import { ChevronRight } from '@/components/layout/LayoutParts'
import type { CalendarEvent, DesignTemplate } from '@/types'
import { TemplateCard } from './TemplateCard'

interface Props {
  events: CalendarEvent[]
  templates: DesignTemplate[]
  onTemplateClick?: (t: DesignTemplate) => void
}

export function FestivalCalendar({ events, templates, onTemplateClick }: Props) {
  const [activeEvent, setActiveEvent] = useState(events[0]?.id ?? 0)
  const templatesRef = useRef<HTMLDivElement>(null)

  const handleSelectEvent = useCallback(
    (id: number) => {
      setActiveEvent(id)
      requestAnimationFrame(() => {
        templatesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    },
    [],
  )

  if (!events.length && !templates.length) return null

  return (
    <section id="hotspot-calendar" className="mb-10 scroll-mt-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="shrink-0 text-lg font-semibold text-ckt-text">节日日历</h2>
        <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto border-b border-gray-100 pb-2">
          {events.map((ev) => (
            <button
              key={ev.id}
              onClick={() => handleSelectEvent(ev.id)}
              className={`shrink-0 whitespace-nowrap pb-2 text-sm transition ${
                activeEvent === ev.id
                  ? 'font-medium text-ckt-text after:block after:h-0.5 after:w-full after:rounded-full after:bg-ckt-primary'
                  : 'text-ckt-text-secondary hover:text-ckt-text'
              }`}
            >
              {ev.name}
              {ev.daysLeft >= 0 && ev.daysLeft <= 7 && (
                <span className="ml-1 text-[11px] text-red-500">{ev.daysLeft}天后</span>
              )}
            </button>
          ))}
        </div>
        <button className="flex shrink-0 items-center gap-0.5 text-xs text-ckt-text-secondary hover:text-ckt-primary">
          更多 <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div ref={templatesRef} className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {templates.slice(0, 6).map((t, i) => (
          <TemplateCard
            key={t.id}
            template={t}
            badge={i < 2 ? 'HOT' : undefined}
            onClick={() => onTemplateClick?.(t)}
          />
        ))}
      </div>
    </section>
  )
}
