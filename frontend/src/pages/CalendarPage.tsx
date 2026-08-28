import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { calendarApi } from '@/api'
import { useDesignActions } from '@/hooks/useDesignActions'
import { HotspotCalendarPanel } from '@/components/calendar/HotspotCalendarPanel'
import { CalendarTemplateGallery } from '@/components/calendar/CalendarTemplateGallery'
import { CalendarPageHeader } from '@/components/calendar/CalendarPageHeader'
import { useLiveDate } from '@/hooks/useLiveDate'
import { enrichCalendarEvents } from '@/utils/calendar'
import { getChuangkitTemplates, mergeChuangkitCalendarEvents } from '@/data/chuangkitCalendar'
import { getOfficialCalendarFestival } from '@/data/chuangkitCalendarOfficial'

function TemplateSkeleton() {
  return (
    <div className="columns-2 gap-3 sm:columns-3 md:columns-4 xl:columns-6 2xl:columns-7">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="mb-4 break-inside-avoid">
          <div
            className="animate-pulse rounded-lg bg-[#eef0f3]"
            style={{ height: 160 + (i % 4) * 60 }}
          />
        </div>
      ))}
    </div>
  )
}

export function CalendarPage() {
  const [searchParams] = useSearchParams()
  const initialEventId = searchParams.get('eventId')
    ? Number(searchParams.get('eventId'))
    : null
  const { handleUseTemplate } = useDesignActions()
  const now = useLiveDate()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [categoriesInitialized, setCategoriesInitialized] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const templatesRef = useRef<HTMLElement>(null)
  const shouldScrollToTemplates = useRef(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['calendarIndex'],
    queryFn: calendarApi.getIndex,
  })

  useEffect(() => {
    if (data && !categoriesInitialized) {
      setSelectedCategories(data.categories.map((c) => c.code))
      const availableEvents = mergeChuangkitCalendarEvents(
        data.events,
        data.categories.map((category) => category.code),
      )
      const preferredId =
        initialEventId && availableEvents.some((event) => event.id === initialEventId)
          ? initialEventId
          : data.events[0]?.id ?? null
      setSelectedEventId(preferredId)
      setCategoriesInitialized(true)
    }
  }, [data, categoriesInitialized, initialEventId])

  const { data: filteredEvents } = useQuery({
    queryKey: ['calendarEvents', selectedCategories.join(',')],
    queryFn: () => calendarApi.getEvents(selectedCategories),
    enabled: selectedCategories.length > 0,
  })

  const rawEvents = useMemo(() => filteredEvents ?? data?.events ?? [], [filteredEvents, data?.events])
  const events = useMemo(
    () => enrichCalendarEvents(mergeChuangkitCalendarEvents(rawEvents, selectedCategories), now),
    [rawEvents, now, selectedCategories],
  )

  const activeEventId = useMemo(() => {
    if (selectedEventId && events.some((e) => e.id === selectedEventId)) {
      return selectedEventId
    }
    return events[0]?.id ?? null
  }, [events, selectedEventId])

  const activeEventName = useMemo(
    () => events.find((event) => event.id === activeEventId)?.name ?? '',
    [activeEventId, events],
  )
  const localTemplates = useMemo(() => getChuangkitTemplates(activeEventName), [activeEventName])
  const officialTotalCount = useMemo(
    () => getOfficialCalendarFestival(activeEventName)?.totalCount,
    [activeEventName],
  )

  const { data: apiTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: ['calendarTemplates', activeEventId],
    queryFn: () => calendarApi.getEventTemplates(activeEventId!, 120),
    enabled: !!activeEventId && localTemplates.length === 0,
  })

  const templates = useMemo(() => {
    return localTemplates.length ? localTemplates : apiTemplates ?? []
  }, [apiTemplates, localTemplates])

  const displayedTemplates = useMemo(() => {
    const list = templates ?? []
    const q = searchKeyword.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.tags?.toLowerCase().includes(q),
    )
  }, [templates, searchKeyword])

  useEffect(() => {
    setSearchKeyword('')
  }, [activeEventId])

  const scrollToTemplates = useCallback(() => {
    document.getElementById('event-templates')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleSelectEvent = useCallback(
    (id: number) => {
      setSelectedEventId(id)
      shouldScrollToTemplates.current = true
      window.setTimeout(scrollToTemplates, 120)
    },
    [scrollToTemplates],
  )

  useEffect(() => {
    if (!shouldScrollToTemplates.current || templatesLoading) return
    shouldScrollToTemplates.current = false
    scrollToTemplates()
  }, [templatesLoading, activeEventId, scrollToTemplates])

  useEffect(() => {
    if (!data || window.location.hash !== '#event-templates') return
    shouldScrollToTemplates.current = true
  }, [data])


  const handleToggleCategory = useCallback((code: string) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
      return next.length ? next : prev
    })
  }, [])

  const handleTemplateClick = useCallback(
    (t: { id: number; title: string }) => void handleUseTemplate(t),
    [handleUseTemplate],
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ckt-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
          <p className="text-ckt-text-secondary">无法加载热点日历</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-ckt-primary px-5 py-2 text-sm text-white"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  const activeEvent = events.find((e) => e.id === activeEventId)

  return (
    <div className="min-h-screen bg-white">
      <CalendarPageHeader keyword={searchKeyword} onKeywordChange={setSearchKeyword} />
      <HotspotCalendarPanel
        categories={data.categories}
        today={data.today}
        events={events}
        selectedCategories={selectedCategories}
        selectedEventId={activeEventId}
        onToggleCategory={handleToggleCategory}
        onSelectEvent={handleSelectEvent}
      />

      <section
        ref={templatesRef}
        id="event-templates"
        className="scroll-mt-[68px] bg-white"
      >
        <div className="px-5 pb-8 pt-0 sm:px-9 2xl:px-9">
          {activeEvent &&
            (templatesLoading ? (
              <TemplateSkeleton />
            ) : (
              <CalendarTemplateGallery
                key={activeEventId}
                eventId={activeEventId}
                eventName={activeEvent.name}
                officialTotalCount={officialTotalCount}
                searchKeyword={searchKeyword}
                templates={displayedTemplates}
                loading={templatesLoading}
                onTemplateClick={handleTemplateClick}
              />
            ))}
        </div>
      </section>
      <CalendarFooter />
    </div>
  )
}

function CalendarFooter() {
  const links = ['创客贴首页', '帮助与支持', '服务文档', '关于我们', '设计学院', '教程', '设计模板', '用户协议', '隐私协议']
  return (
    <footer className="border-t border-[#eef0f3] bg-white px-5 pb-8 pt-7 text-center sm:px-7 2xl:px-8">
      <div className="flex flex-wrap justify-center gap-x-7 gap-y-2 text-[13px] text-[#737b8c]">
        {links.map((item) => <a key={item} href="#" className="transition hover:text-[#1677ff]">{item}</a>)}
      </div>
      <p className="mt-5 text-[12px] text-[#a1a8b5]">Copyright©北京艺源科技有限公司　京公网安备 11010502049358号　京ICP备14056892号-1</p>
    </footer>
  )
}
