import { useMemo, useState } from 'react'
import { Heart, Play, Share2, WandSparkles } from 'lucide-react'
import {
  AI_TEMPLATE_GALLERIES,
  AI_TEMPLATE_SCENES,
  type AiTemplateGalleryItem,
  type AiTemplateSceneCode,
} from '@/data/aiTemplateGallery'
import { cn, coverFallback } from '@/utils'

interface Props {
  onSelectDesignTemplates: () => void
  onMakeSame: (item: AiTemplateGalleryItem) => void
}

function GalleryCard({ item, onMakeSame }: { item: AiTemplateGalleryItem; onMakeSame: () => void }) {
  const [failed, setFailed] = useState(false)
  const [liked, setLiked] = useState(false)

  return (
    <article className="ai-template-card" style={{ aspectRatio: item.ratio }}>
      <img
        src={failed ? coverFallback(`ai-gallery-${item.id}`, 640, 800) : item.image}
        alt={item.title}
        loading="lazy"
        onError={() => setFailed(true)}
      />
      {item.isVideo && <span className="ai-template-card__play"><Play className="h-3.5 w-3.5 fill-current" /></span>}
      <div className="ai-template-card__shade">
        <p>{item.title}</p>
        <div className="ai-template-card__actions">
          <button type="button" className="ai-template-card__make" onClick={onMakeSame}>
            <WandSparkles className="h-3.5 w-3.5" /> 做同款
          </button>
          <button
            type="button"
            className={cn('ai-template-card__icon', liked && 'ai-template-card__icon--active')}
            aria-label={liked ? '取消收藏' : '收藏'}
            onClick={(event) => {
              event.stopPropagation()
              setLiked((value) => !value)
            }}
          >
            <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
          </button>
          <button type="button" className="ai-template-card__icon" aria-label="分享" onClick={(event) => event.stopPropagation()}>
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  )
}

/** 截图式 AI 模板瀑布流：每个场景使用独立素材集合。 */
export function AiTemplateGallery({ onSelectDesignTemplates, onMakeSame }: Props) {
  const [activeScene, setActiveScene] = useState<AiTemplateSceneCode>('product_detail')
  const [activeTag, setActiveTag] = useState('全部')
  const activeSceneData = AI_TEMPLATE_SCENES.find((scene) => scene.code === activeScene)!
  const allItems = AI_TEMPLATE_GALLERIES[activeScene]
  const items = useMemo(() => {
    if (activeTag === '全部') return allItems
    return allItems.filter((_, index) => index % activeSceneData.tags!.length === activeSceneData.tags!.indexOf(activeTag))
  }, [activeSceneData.tags, activeTag, allItems])

  const handleSceneSelect = (scene: AiTemplateSceneCode) => {
    setActiveScene(scene)
    setActiveTag('全部')
  }

  return (
    <div className="ai-template-gallery-page">
      <div className="ai-template-gallery-page__header">
        <div className="ai-template-switch" role="tablist" aria-label="模板类型">
          <button type="button" role="tab" aria-selected={false} onClick={onSelectDesignTemplates}>设计模板</button>
          <button type="button" role="tab" aria-selected className="ai-template-switch__active">AI模板</button>
        </div>

        <div className="ai-template-scenes" aria-label="AI 模板场景">
          <span className="ai-template-scenes__label">场景：</span>
          {AI_TEMPLATE_SCENES.map((scene) => (
            <button
              key={scene.code}
              type="button"
              className={cn('ai-template-scenes__item', activeScene === scene.code && 'ai-template-scenes__item--active')}
              onClick={() => handleSceneSelect(scene.code)}
            >
              <span aria-hidden>{scene.icon}</span>{scene.name}
            </button>
          ))}
        </div>

        {activeSceneData.tags && (
          <div className="ai-template-tags" aria-label="电商营销图分类">
            <span className="ai-template-scenes__label">专题：</span>
            {activeSceneData.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={cn('ai-template-tags__item', activeTag === tag && 'ai-template-tags__item--active')}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="ai-template-gallery" aria-live="polite">
        {items.map((item) => (
          <GalleryCard key={item.id} item={item} onMakeSame={() => onMakeSame(item)} />
        ))}
      </main>
      <p className="ai-template-gallery__end">没有更多了</p>
    </div>
  )
}
