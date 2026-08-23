import { useState } from 'react'
import {
  Eye,
  Heart,
  MoreHorizontal,
  Sparkles,
  Maximize2,
  X,
} from 'lucide-react'
import type { RecommendTemplate, AiGenerateResult } from '@/types'
import { coverFallback } from '@/utils'
import { cn } from '@/utils'

interface Props {
  template: RecommendTemplate
  variant?: 'scroll' | 'masonry'
  badge?: 'NEW' | 'HOT'
  hideTitle?: boolean
  onUse?: (t: RecommendTemplate) => void
  onLike?: (t: RecommendTemplate) => void
  onReferenceGenerate?: (t: RecommendTemplate) => Promise<AiGenerateResult | void>
  generating?: boolean
}

export function RecommendTemplateCard({
  template,
  variant = 'scroll',
  badge,
  hideTitle,
  onUse,
  onLike,
  onReferenceGenerate,
  generating,
}: Props) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  const cover =
    !imgFailed && template.coverUrl
      ? template.coverUrl
      : coverFallback(`rec-${template.id}`, 400, 560)

  const handleReference = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await onReferenceGenerate?.(template)
  }

  const isMasonry = variant === 'masonry'
  const aspectStyle = isMasonry
    ? { aspectRatio: `${template.width || 3} / ${template.height || 4}` }
    : undefined

  return (
    <>
      <article
        className={cn(
          'recommend-card group relative cursor-pointer',
          isMasonry ? 'recommend-card--masonry w-full' : 'w-[160px] shrink-0 sm:w-[172px]',
        )}
        onClick={() => onUse?.(template)}
      >
        <div
          className={cn(
            'relative overflow-hidden bg-gray-100',
            isMasonry ? 'rounded-lg' : 'rounded-xl aspect-[3/4]',
          )}
          style={aspectStyle}
        >
          <img
            src={cover}
            alt={template.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />

          {badge && (
            <span
              className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-medium text-white ${
                badge === 'HOT' ? 'bg-orange-500' : 'bg-red-500'
              }`}
            >
              {badge}
            </span>
          )}

          {template.isFree === 1 && !badge && (
            <span
              className={cn(
                'recommend-free-badge',
                isMasonry && 'recommend-free-badge--pill',
              )}
            >
              免费
            </span>
          )}

          <div className="recommend-card-overlay pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20 opacity-0 transition duration-200 group-hover:opacity-100" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2 opacity-0 transition duration-200 group-hover:opacity-100">
            <div className="pointer-events-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setPreviewOpen(true)
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ckt-text shadow-sm transition hover:bg-white"
                aria-label="预览"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onLike?.(template)
                }}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:bg-white',
                  template.liked ? 'text-red-500' : 'text-ckt-text',
                )}
                aria-label="收藏"
              >
                <Heart className={cn('h-4 w-4', template.liked && 'fill-current')} />
              </button>
            </div>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ckt-text shadow-sm transition hover:bg-white"
              aria-label="更多"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2.5 opacity-0 transition duration-200 group-hover:opacity-100">
            <button
              type="button"
              disabled={generating}
              onClick={handleReference}
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-ckt-primary px-3.5 py-2 text-xs font-medium text-white shadow-md transition hover:brightness-110 disabled:opacity-70"
            >
              {generating ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              参考生图
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setPreviewOpen(true)
              }}
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ckt-text shadow-sm transition hover:bg-white"
              aria-label="放大预览"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {!hideTitle && (
          <p className="mt-2 truncate text-xs text-ckt-text-secondary">{template.title}</p>
        )}
      </article>

      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative max-h-[85vh] max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-1.5 text-white transition hover:bg-black/60"
            >
              <X className="h-4 w-4" />
            </button>
            <img src={cover} alt={template.title} className="max-h-[70vh] w-full object-contain" />
            <div className="border-t border-ckt-border px-4 py-3">
              <p className="text-sm font-medium text-ckt-text">{template.title}</p>
              {template.likeCount != null && (
                <p className="mt-0.5 text-xs text-ckt-text-secondary">{template.likeCount} 人收藏</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
