import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { templateApi } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { RecommendTemplateCard } from './RecommendTemplateCard'
import type { AiGenerateResult, DesignTemplate, RecommendTemplate, TemplateCategory } from '@/types'

interface Props {
  categories: TemplateCategory[]
  activeCategory: string
  onCategoryChange: (code: string) => void
  onUseTemplate?: (t: DesignTemplate) => void
  onReferenceResult?: (result: AiGenerateResult) => void
}

function toRecommendTemplate(t: DesignTemplate): RecommendTemplate {
  return {
    ...t,
    liked: 'liked' in t ? (t as RecommendTemplate).liked : false,
    likeCount: 'likeCount' in t ? (t as RecommendTemplate).likeCount : 0,
  }
}

export function RecommendSection({
  categories,
  activeCategory,
  onCategoryChange,
  onUseTemplate,
  onReferenceResult,
}: Props) {
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const queryClient = useQueryClient()
  const [generatingId, setGeneratingId] = useState<number | null>(null)
  const [tabsExpanded, setTabsExpanded] = useState(false)

  const { data: templates, isLoading } = useQuery({
    queryKey: ['recommendMasonry', activeCategory],
    queryFn: async () => {
      if (activeCategory === 'recommend') {
        return templateApi.recommend(60)
      }
      const cat = categories.find((c) => c.code === activeCategory)
      const res = await templateApi.list(1, 60, cat?.id)
      return res.list.map(toRecommendTemplate)
    },
    staleTime: 60_000,
    enabled: activeCategory === 'recommend' || categories.length > 0,
  })

  const updateTemplate = useCallback(
    (id: number, patch: Partial<RecommendTemplate>) => {
      queryClient.setQueryData<RecommendTemplate[]>(['recommendMasonry', activeCategory], (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      )
    },
    [queryClient, activeCategory],
  )

  const handleLike = useCallback(
    async (t: RecommendTemplate) => {
      if (!isLoggedIn) {
        setShowLoginModal(true)
        return
      }
      try {
        const res = await templateApi.like(t.id)
        updateTemplate(t.id, { liked: res.liked, likeCount: res.likeCount })
      } catch (e) {
        alert(e instanceof Error ? e.message : '操作失败')
      }
    },
    [isLoggedIn, setShowLoginModal, updateTemplate],
  )

  const handleReferenceGenerate = useCallback(
    async (t: RecommendTemplate) => {
      setGeneratingId(t.id)
      try {
        await templateApi.view(t.id)
        const result = await templateApi.referenceGenerate(t.id)
        onReferenceResult?.(result)
      } catch (e) {
        alert(e instanceof Error ? e.message : '参考生图失败')
      } finally {
        setGeneratingId(null)
      }
    },
    [onReferenceResult],
  )

  const handleUse = useCallback(
    (t: RecommendTemplate) => {
      templateApi.view(t.id).catch(() => {})
      onUseTemplate?.(t)
    },
    [onUseTemplate],
  )

  const filterTabs = categories
    .filter((c) => c.code !== 'recommend')
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const visibleTabs = tabsExpanded ? filterTabs : filterTabs.slice(0, 13)

  return (
    <section id="recommend-section" className="mb-10">
      <div className="recommend-tabs mb-5">
        <h2 className="recommend-tabs__title">为你推荐</h2>
        <div className={`recommend-tabs__list ${tabsExpanded ? 'is-expanded' : ''}`}>
          {visibleTabs.map((cat) => (
            <button
              key={cat.code}
              type="button"
              onClick={() => onCategoryChange(cat.code)}
              className={`recommend-tabs__item ${activeCategory === cat.code ? 'is-active' : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        {filterTabs.length > 0 && (
          <button
            type="button"
            onClick={() => setTabsExpanded((v) => !v)}
            className="recommend-tabs__expand"
            aria-label={tabsExpanded ? '收起分类' : '展开分类'}
          >
            <ChevronDown className={`h-4 w-4 transition ${tabsExpanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="recommend-masonry">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="recommend-masonry__item">
              <div
                className="animate-pulse rounded-xl bg-gray-100"
                style={{ aspectRatio: i % 3 === 0 ? '16 / 9' : i % 2 === 0 ? '3 / 4' : '9 / 16' }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="recommend-masonry">
          {templates?.map((t) => (
            <div key={t.id} className="recommend-masonry__item">
              <RecommendTemplateCard
                template={t}
                variant="masonry"
                hideTitle
                onUse={handleUse}
                onLike={handleLike}
                onReferenceGenerate={handleReferenceGenerate}
                generating={generatingId === t.id}
              />
            </div>
          ))}
        </div>
      )}

      {!isLoading && templates?.length === 0 && (
        <p className="py-12 text-center text-sm text-ckt-text-secondary">暂无模板</p>
      )}

      {!isLoading && !!templates?.length && (
        <div className="py-10 text-center text-xs text-gray-400">- 到底了 -</div>
      )}
    </section>
  )
}
