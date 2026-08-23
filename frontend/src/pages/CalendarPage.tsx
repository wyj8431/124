import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { calendarApi, designApi, templateApi } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { CalendarPageHeader } from '@/components/calendar/CalendarPageHeader'
import { HotspotCalendarPanel } from '@/components/calendar/HotspotCalendarPanel'
import { CalendarTemplateGallery } from '@/components/calendar/CalendarTemplateGallery'
import { useLiveDate } from '@/hooks/useLiveDate'
import { enrichCalendarEvents } from '@/utils/calendar'

function TemplateSkeleton() {
  return (
    <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5">
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
  const { isLoggedIn, setShowLoginModal } = useAuth()
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
      const preferredId =
        initialEventId && data.events.some((e) => e.id === initialEventId)
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

  const rawEvents = filteredEvents ?? data?.events ?? []
  const events = useMemo(() => enrichCalendarEvents(rawEvents, now), [rawEvents, now])

  const activeEventId = useMemo(() => {
    if (selectedEventId && events.some((e) => e.id === selectedEventId)) {
      return selectedEventId
    }
    return events[0]?.id ?? null
  }, [events, selectedEventId])

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['calendarTemplates', activeEventId],
    queryFn: () => calendarApi.getEventTemplates(activeEventId!, 120),
    enabled: !!activeEventId,
  })

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

  const handleSearch = useCallback(() => {
    scrollToTemplates()
  }, [scrollToTemplates])

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
    async (t: { id: number; title: string }) => {
      if (!isLoggedIn) {
        setShowLoginModal(true)
        return
      }
      try {
        await templateApi.use(t.id)
        await designApi.create({ templateId: t.id, title: t.title })
        alert(`已基于「${t.title}」创建设计`)
      } catch {
        alert('操作失败，请确认后端已启动')
      }
    },
    [isLoggedIn, setShowLoginModal],
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <CalendarPageHeader
          keyword={searchKeyword}
          onKeywordChange={setSearchKeyword}
          onSearch={handleSearch}
        />
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ckt-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white">
        <CalendarPageHeader
          keyword={searchKeyword}
          onKeywordChange={setSearchKeyword}
          onSearch={handleSearch}
        />
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
    <div className="min-h-screen bg-[#f5f7fa]">
      <CalendarPageHeader
        keyword={searchKeyword}
        onKeywordChange={setSearchKeyword}
        onSearch={handleSearch}
      />
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
        <div className="mx-auto max-w-[1200px] px-6 pb-10 pt-6">
          {activeEvent &&
            (templatesLoading ? (
              <TemplateSkeleton />
            ) : (
              <CalendarTemplateGallery
                key={activeEventId}
                eventId={activeEventId}
                eventName={activeEvent.name}
                searchKeyword={searchKeyword}
                templates={displayedTemplates}
                loading={templatesLoading}
                onTemplateClick={handleTemplateClick}
              />
            ))}
        </div>
      </section>
    </div>
  )
}
