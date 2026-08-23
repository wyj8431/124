import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { homeApi, templateApi, designApi } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { useDesignActions } from '@/hooks/useDesignActions'
import { HeroSearch } from '@/components/home/HeroSearch'
import { AiGenerateResultPanel } from '@/components/home/AiGenerateResultPanel'
import { QuickStartPanel } from '@/components/home/QuickStartPanel'
import { RecommendSection } from '@/components/home/RecommendSection'
import { HotCalendarSection } from '@/components/home/HotCalendarSection'
import { EditorPicksSection } from '@/components/home/EditorPicksSection'
import { TopicScrollSection } from '@/components/home/TopicScrollSection'
import { TopicRecommendSection } from '@/components/home/TopicRecommendSection'
import { TemplateSection } from '@/components/home/TemplateSection'
import type { AiGenerateResult, DesignTemplate, EditorCollection, HomeFeature } from '@/types'

export function HomePage() {
  const navigate = useNavigate()
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const { handleCreate, invalidateSidebar, openCreateModal } = useDesignActions()
  const [activeFeatureTab, setActiveFeatureTab] = useState('hot')
  const [activeCategory, setActiveCategory] = useState('recommend')
  const [searchResults, setSearchResults] = useState<DesignTemplate[] | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [generateResult, setGenerateResult] = useState<AiGenerateResult | null>(null)

  const { data: homeData, isLoading, error } = useQuery({
    queryKey: ['homeIndex'],
    queryFn: homeApi.getIndex,
    staleTime: 60_000,
  })

  const { data: featureCards, isLoading: featuresLoading } = useQuery({
    queryKey: ['features', activeFeatureTab],
    queryFn: () => homeApi.getFeatures(activeFeatureTab),
    enabled: !!homeData,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: homeApi.getCategories,
    enabled: !!homeData,
  })

  const { data: qixiTemplates } = useQuery({
    queryKey: ['templates', 'qixi'],
    queryFn: async () => {
      const cats = await homeApi.getCategories()
      const qixi = cats.find((c) => c.code === 'qixi')
      const res = await templateApi.list(1, 6, qixi?.id)
      return res.list
    },
    enabled: !!homeData && !searchResults,
  })

  const { data: videoTemplates } = useQuery({
    queryKey: ['templates', 'video'],
    queryFn: async () => {
      const cats = await homeApi.getCategories()
      const wechat = cats.find((c) => c.code === 'wechat')
      const res = await templateApi.list(1, 6, wechat?.id)
      return res.list.length ? res.list : (await templateApi.list(1, 6)).list
    },
    enabled: !!homeData && !searchResults,
  })

  const handleSearch = useCallback(async (keyword: string, _tabCode?: string) => {
    setSearchKeyword(keyword)
    if (!keyword) {
      setSearchResults(null)
      return
    }
    const res = await templateApi.search(keyword, 1, 24)
    setSearchResults(res.list)
  }, [])

  const handleTemplateClick = useCallback(
    async (t: DesignTemplate) => {
      if (!isLoggedIn) {
        setShowLoginModal(true)
        return
      }
      try {
        await templateApi.use(t.id)
        await designApi.create({ templateId: t.id, title: t.title })
        invalidateSidebar()
        alert(`已基于「${t.title}」创建设计`)
      } catch {
        alert('操作失败，请确认后端已启动')
      }
    },
    [isLoggedIn, setShowLoginModal, invalidateSidebar],
  )

  const handleFeatureClick = useCallback(
    (feature: HomeFeature) => {
      if (feature.linkType === 'scene') {
        const scene = homeData?.scenes.find((s) => s.code === feature.linkValue)
        if (scene?.code === 'create') {
          openCreateModal()
        } else if (scene) {
          handleCreate(scene.id)
        }
        return
      }
      if (feature.linkType === 'ai_tool') {
        if (feature.linkValue === 'ai_video') {
          navigate('/designtools/aitopic/aishipin')
          return
        }
        if (feature.linkValue === 'matting') {
          navigate('/editor/koutu?fmodule=fuction&fpage=home')
          return
        }
        if (feature.linkValue === 'ai_poster') {
          navigate('/designtools/aitopic/AIhaibao')
          return
        }
        alert(`即将打开 AI 工具：${feature.title}`)
        return
      }
      if (feature.linkType === 'template_category') {
        setActiveCategory(feature.linkValue)
        document.getElementById('recommend-section')?.scrollIntoView({ behavior: 'smooth' })
        return
      }
      if (feature.linkType === 'url') {
        if (feature.linkValue === '/calendar' || feature.linkValue.startsWith('/calendar')) {
          navigate('/calendar')
          return
        }
        alert(`即将跳转：${feature.linkValue}`)
      }
    },
    [homeData?.scenes, handleCreate, navigate, openCreateModal],
  )

  const handleCollectionClick = useCallback(
    (collection: EditorCollection) => {
      if (collection.categoryCode) {
        setActiveCategory(collection.categoryCode)
      }
      document.getElementById('recommend-section')?.scrollIntoView({ behavior: 'smooth' })
    },
    [],
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ckt-primary border-t-transparent" />
          <p className="text-sm text-ckt-text-secondary">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !homeData) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-white px-6">
        <p className="text-ckt-text-secondary">无法连接后端服务</p>
        <p className="text-sm text-gray-400">
          请先启动后端：<code className="rounded bg-gray-100 px-2 py-1">cd backend &amp;&amp; mvn spring-boot:run</code>
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-ckt-primary px-6 py-2 text-sm text-white"
        >
          重试
        </button>
      </div>
    )
  }

  const festivalTemplates =
    qixiTemplates?.length ? qixiTemplates : homeData.recommendTemplates.slice(0, 6)

  return (
    <div className="animate-fade-in bg-white pb-28">
      <div className="w-full px-6 pb-28 xl:px-10 2xl:px-12">
        <HeroSearch
          searchTabs={homeData.searchTabs}
          hotTags={homeData.hotTags}
          onSearch={(kw, tab) => handleSearch(kw, tab)}
          onGenerate={setGenerateResult}
        />

        <AiGenerateResultPanel result={generateResult} onClose={() => setGenerateResult(null)} />

        {searchResults ? (
          <TemplateSection
            title={`搜索「${searchKeyword}」的结果`}
            templates={searchResults}
            columns={6}
            onTemplateClick={handleTemplateClick}
          />
        ) : (
          <>
            <QuickStartPanel
              quickStartScenes={
                homeData.quickStartScenes?.length
                  ? homeData.quickStartScenes
                  : homeData.scenes.slice(0, 3)
              }
              tabs={homeData.homeTabs}
              cards={featureCards ?? homeData.featureCards}
              activeTab={activeFeatureTab}
              onTabChange={setActiveFeatureTab}
              loading={featuresLoading}
              onSceneClick={(sceneId) => {
                const scene = (
                  homeData.quickStartScenes?.length
                    ? homeData.quickStartScenes
                    : homeData.scenes.slice(0, 3)
                ).find((s) => s.id === sceneId)
                if (scene?.code === 'create') {
                  openCreateModal()
                } else {
                  handleCreate(sceneId)
                }
              }}
              onFeatureClick={handleFeatureClick}
            />

            <RecommendSection
              categories={categories ?? []}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              onUseTemplate={handleTemplateClick}
              onReferenceResult={setGenerateResult}
            />

            <HotCalendarSection events={homeData.calendarEvents} />

            <EditorPicksSection onSelect={handleCollectionClick} />

            <TopicScrollSection sectionCode="xibao" onTemplateClick={handleTemplateClick} />

            <TopicRecommendSection
              sectionCode="zhaopin"
              onUseTemplate={handleTemplateClick}
              onReferenceResult={setGenerateResult}
            />

            <TemplateSection
              title="营销海报"
              subtitle="海量营销海报，一键套用"
              templates={festivalTemplates}
              columns={6}
              onTemplateClick={handleTemplateClick}
            />

            <TemplateSection
              title="短视频"
              subtitle="爆款短视频封面与脚本"
              templates={videoTemplates ?? []}
              columns={6}
              aspect="landscape"
              showPlay
              onTemplateClick={handleTemplateClick}
            />

          </>
        )}
      </div>
    </div>
  )
}
