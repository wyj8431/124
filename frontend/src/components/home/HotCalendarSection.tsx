import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from '@/components/layout/LayoutParts'
import type { CalendarEvent } from '@/types'
import { coverFallback, formatDate } from '@/utils'
import { getChuangkitTemplates, mergeChuangkitCalendarEvents } from '@/data/chuangkitCalendar'

interface Props {
  events: CalendarEvent[]
}

export function HotCalendarSection({ events }: Props) {
  const navigate = useNavigate()
  const calendarEvents = useMemo(() => {
    const seenNames = new Set<string>()
    return mergeChuangkitCalendarEvents(events)
      .filter((event) => {
        if (seenNames.has(event.name)) return false
        seenNames.add(event.name)
        return true
      })
      .slice(0, 7)
  }, [events])
  const [activeEventId, setActiveEventId] = useState<number | null>(calendarEvents[0]?.id ?? null)

  useEffect(() => {
    if (calendarEvents.length && !calendarEvents.some((event) => event.id === activeEventId)) {
      setActiveEventId(calendarEvents[0].id)
    }
  }, [activeEventId, calendarEvents])

  const activeEvent = calendarEvents.find((event) => event.id === activeEventId) ?? calendarEvents[0]
  const templates = useMemo(() => {
    if (!activeEvent) return []

    const officialTemplates = getChuangkitTemplates(activeEvent.name)
    const seenCovers = new Set<string>()
    const uniqueTemplates = officialTemplates.filter((template) => {
      const cover = template.coverUrl || `id-${template.id}`
      if (seenCovers.has(cover)) return false
      seenCovers.add(cover)
      return true
    })
    const portraitTemplates = uniqueTemplates.filter(
      (template) => template.width > 0 && template.height / template.width >= 1.25,
    )

    return (portraitTemplates.length >= 7 ? portraitTemplates : uniqueTemplates).slice(0, 7)
  }, [activeEvent])

  if (!calendarEvents.length) return null

  return (
    <section className="hot-calendar-section mb-10">
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

      <div className="hot-calendar-event-list">
        {calendarEvents.map((ev) => (
          <button
            key={ev.id}
            type="button"
            onClick={() => setActiveEventId(ev.id)}
            className={`hot-calendar-event${activeEventId === ev.id ? ' is-active' : ''}`}
          >
            <div className="min-w-0">
              <div className="truncate text-[17px] font-semibold text-ckt-text">{ev.name}</div>
              <div className="mt-0.5 text-[13px] text-ckt-text-secondary">
                {formatDate(ev.eventDate)}
              </div>
            </div>
            <div className={`hot-calendar-countdown${ev.daysLeft <= 7 ? ' is-urgent' : ''}`}>
              <span>{ev.daysLeft}</span>
              <span>天后</span>
            </div>
          </button>
        ))}
      </div>

      <div className="hot-calendar-template-wrap">
        {templates.length ? (
          <div className="hot-calendar-template-list">
            {templates.slice(0, 7).map((template) => (
              <button
                key={template.id}
                type="button"
                className="hot-calendar-template"
                onClick={() => {
                  const projectEvent = events.find((event) => event.name === activeEvent?.name)
                  if (projectEvent) {
                    navigate(`/calendar?eventId=${projectEvent.id}`)
                  } else {
                    navigate(`/calendar?keyword=${encodeURIComponent(activeEvent?.name ?? template.title)}`)
                  }
                }}
                aria-label={`查看模板：${template.title}`}
              >
                <img
                  src={template.coverUrl || coverFallback(`calendar-${template.id}`, 400, 560)}
                  alt={template.title}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null
                    event.currentTarget.src = coverFallback(`calendar-${template.id}`, 400, 560)
                  }}
                />
              </button>
            ))}
          </div>
        ) : (
          <p className="hot-calendar-template-empty">暂无对应节日模板</p>
        )}
        {templates.length > 5 ? (
          <button
            type="button"
            className="hot-calendar-template-next"
            onClick={() => {
              const projectEvent = events.find((event) => event.name === activeEvent?.name)
              navigate(
                projectEvent
                  ? `/calendar?eventId=${projectEvent.id}`
                  : `/calendar?keyword=${encodeURIComponent(activeEvent?.name ?? '')}`,
              )
            }}
            aria-label="查看节日模板"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : null}
      </div>
    </section>
  )
}
