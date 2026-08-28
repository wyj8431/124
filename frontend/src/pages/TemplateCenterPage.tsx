import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight, LayoutGrid } from 'lucide-react'
import { calendarApi, templateCenterApi } from '@/api'
import { HotspotCalendarPanel } from '@/components/calendar/HotspotCalendarPanel'
import { TemplateCenterFilterRows } from '@/components/template-center/TemplateCenterFilterRows'
import { TemplateCenterHeader } from '@/components/template-center/TemplateCenterHeader'
import { TemplateCenterMasonry } from '@/components/template-center/TemplateCenterMasonry'
import { TemplateCenterSortBar } from '@/components/template-center/TemplateCenterSortBar'
import { AiTemplateGallery } from '@/components/template-center/AiTemplateGallery'
import { useLiveDate } from '@/hooks/useLiveDate'
import { useDesignActions } from '@/hooks/useDesignActions'
import type { DesignTemplate } from '@/types'
import { enrichCalendarEvents } from '@/utils/calendar'
import { cn } from '@/utils'
import '@/styles/ai-template-gallery.css'

export function TemplateCenterPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const calendarMode = searchParams.get('view') === 'calendar'
  const initialEventId = searchParams.get('eventId')
    ? Number(searchParams.get('eventId'))
    : null

  const now = useLiveDate()

  const [activeTab, setActiveTab] = useState(() =>
    searchParams.get('aiMode') === 'template' ? 'ai' : 'design',
  )
  const [activeNav, setActiveNav] = useState('center')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    category: 'all',
    scene: 'recommend',
    industry: 'all',
  })
  const [extraValues, setExtraValues] = useState<Record<string, string>>({})
  const [activeSort, setActiveSort] = useState('hot')
  const [bundleOnly, setBundleOnly] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const { handleUseTemplate } = useDesignActions()

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedEventId, setSelectedEventId] = useState<number | null>(initialEventId)
  const [categoriesInitialized, setCategoriesInitialized] = useState(false)
  const templatesRef = useRef<HTMLDivElement>(null)

  const { data: indexData, isLoading: indexLoading, error: indexError } = useQuery({
    queryKey: ['templateCenterIndex'],
    queryFn: templateCenterApi.getIndex,
  })

  const { data: calendarData, isLoading: calendarLoading } = useQuery({
    queryKey: ['calendarIndex'],
    queryFn: calendarApi.getIndex,
    enabled: calendarMode,
  })

  useEffect(() => {
    if (calendarData && !categoriesInitialized) {
      setSelectedCategories(calendarData.categories.map((c) => c.code))
      if (!selectedEventId) {
        setSelectedEventId(calendarData.events[0]?.id ?? null)
      }
      setCategoriesInitialized(true)
    }
  }, [calendarData, categoriesInitialized, selectedEventId])

  const { data: filteredEvents } = useQuery({
    queryKey: ['calendarEvents', selectedCategories.join(',')],
    queryFn: () => calendarApi.getEvents(selectedCategories),
    enabled: calendarMode && selectedCategories.length > 0,
  })

  const rawEvents = filteredEvents ?? calendarData?.events ?? []
  const events = useMemo(() => enrichCalendarEvents(rawEvents, now), [rawEvents, now])

  const activeEventId = useMemo(() => {
    if (selectedEventId && events.some((e) => e.id === selectedEventId)) {
      return selectedEventId
    }
    return events[0]?.id ?? null
  }, [events, selectedEventId])

  const queryParams = useMemo(
    () => ({
      tab: activeTab,
      category: filterValues.category === 'all' ? undefined : filterValues.category,
      scene: filterValues.scene === 'recommend' ? undefined : filterValues.scene,
      industry: filterValues.industry === 'all' ? undefined : filterValues.industry,
      sort: activeSort,
      color: extraValues.color,
      usage: extraValues.usage,
      style: extraValues.style,
      layout: extraValues.layout,
      price: extraValues.price,
      type: extraValues.type,
      keyword: searchKeyword.trim() || undefined,
      calendarEventId: calendarMode && activeEventId ? activeEventId : undefined,
      limit: 60,
    }),
    [
      activeTab,
      filterValues,
      extraValues,
      activeSort,
      searchKeyword,
      calendarMode,
      activeEventId,
    ],
  )

  const { data: templateResult, isLoading: templatesLoading } = useQuery({
    queryKey: ['templateCenterTemplates', queryParams],
    queryFn: () => templateCenterApi.listTemplates(queryParams),
    enabled: !!indexData && (!calendarMode || !!activeEventId),
  })

  const templates = templateResult?.list ?? []

  const navigate = useNavigate()

  const handleFilterChange = useCallback((groupCode: string, optionCode: string) => {
    setActiveNav('center')
    setFilterValues((prev) => ({ ...prev, [groupCode]: optionCode }))
  }, [])

  const handleNavChange = useCallback((code: string, linkValue?: string) => {
    setActiveNav(code)
    if (code === 'center') {
      setFilterValues({ category: 'all', scene: 'recommend', industry: 'all' })
      return
    }
    if (linkValue) {
      setFilterValues((prev) => ({ ...prev, category: linkValue, scene: 'recommend' }))
    }
  }, [])

  const handleSearch = useCallback(() => {
    setSearchKeyword(keyword)
    templatesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [keyword])

  const handleSelectEvent = useCallback((id: number) => {
    setSelectedEventId(id)
    setSearchParams({ view: 'calendar', eventId: String(id) }, { replace: true })
    window.setTimeout(() => {
      templatesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }, [setSearchParams])

  const handleToggleCategory = useCallback((code: string) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
      return next.length ? next : prev
    })
  }, [])

  const handleTemplateClick = useCallback(
    (t: DesignTemplate) => void handleUseTemplate(t),
    [handleUseTemplate],
  )

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
    if (tab === 'ai') {
      setSearchParams({ aiMode: 'template' }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }, [setSearchParams])

  if (indexLoading) {
    return (
      <div className="min-h-screen bg-white">
        <TemplateCenterHeader keyword={keyword} onKeywordChange={setKeyword} />
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ckt-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (indexError || !indexData) {
    return (
      <div className="min-h-screen bg-white">
        <TemplateCenterHeader keyword={keyword} onKeywordChange={setKeyword} />
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
          <p className="text-ckt-text-secondary">无法加载模板中心</p>
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

  if (activeTab === 'ai') {
    return (
      <div className="ai-template-page min-h-screen bg-white">
        <TemplateCenterHeader
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSearch={handleSearch}
        />
        <AiTemplateGallery
          onSelectDesignTemplates={() => handleTabChange('design')}
          onMakeSame={() => navigate('/designtools/aitopic/AIhaibao')}
        />
      </div>
    )
  }

  return (
    <div className="tc-page min-h-screen bg-[#f5f7fa]">
      <TemplateCenterHeader
        keyword={keyword}
        onKeywordChange={setKeyword}
        onSearch={handleSearch}
      />

      <div className="tc-nav-shell">
        <div className="tc-nav-strip mx-auto max-w-[1400px] px-6">
          <div className="tc-nav-strip__lead"><LayoutGrid className="h-4 w-4" /> 模板资源</div>
          <div className="tc-nav-strip__items">
            {indexData.navItems.slice(0, 7).map((item) => (
              <button
                key={item.code}
                type="button"
                className={cn('tc-nav-item', activeNav === item.code && 'tc-nav-item--active')}
                onClick={() => handleNavChange(item.code, item.linkValue)}
              >
                {item.name}
              </button>
            ))}
          </div>
          <button type="button" className="tc-nav-more" onClick={() => handleNavChange('center')}>
            更多 <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {calendarMode && calendarData && !calendarLoading && (
        <HotspotCalendarPanel
          categories={calendarData.categories}
          today={calendarData.today}
          events={events}
          selectedCategories={selectedCategories}
          selectedEventId={activeEventId}
          onToggleCategory={handleToggleCategory}
          onSelectEvent={handleSelectEvent}
        />
      )}

      <div className="tc-layout mx-auto max-w-[1400px] px-6 py-5">
        <div className="tc-main__panel rounded-xl bg-white px-6 py-5 shadow-sm">
              <div className="tc-tabs mb-5 flex gap-3">
                {indexData.tabs.map((tab) => (
                  <button
                    key={tab.code}
                    type="button"
                    onClick={() => handleTabChange(tab.code)}
                    className={cn('tc-tab', activeTab === tab.code && 'tc-tab--active')}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>

              <TemplateCenterFilterRows
                groups={indexData.filterGroups}
                values={filterValues}
                onChange={handleFilterChange}
              />

              <div className="my-4 border-t border-[#eef0f3]" />

              <TemplateCenterSortBar
                sortOptions={indexData.sortOptions}
                extraFilters={indexData.extraFilters}
                activeSort={activeSort}
                extraValues={extraValues}
                bundleOnly={bundleOnly}
                onSortChange={setActiveSort}
                onExtraChange={(code, val) =>
                  setExtraValues((prev) => ({ ...prev, [code]: val }))
                }
                onBundleOnlyChange={setBundleOnly}
              />

              <div ref={templatesRef} className="mt-5 scroll-mt-[80px]">
                <div className="tc-results-meta mb-3">
                  <span>{searchKeyword.trim() ? `搜索“${searchKeyword.trim()}”` : '热门模板'}</span>
                  <span className="tc-results-meta__count">共 {templateResult?.total ?? templates.length} 个模板</span>
                </div>
                {calendarMode && activeEvent && (
                  <p className="mb-4 text-[13px] text-[#646a73]">
                    {searchKeyword.trim()
                      ? `在「${activeEvent.name}」中搜索「${searchKeyword.trim()}」，找到 ${templates.length} 个模板`
                      : `为「${activeEvent.name}」推荐 ${templates.length} 个模板`}
                  </p>
                )}
                <TemplateCenterMasonry
                  templates={templates}
                  loading={templatesLoading}
                  onTemplateClick={handleTemplateClick}
                />
              </div>
        </div>
      </div>
    </div>
  )
}
