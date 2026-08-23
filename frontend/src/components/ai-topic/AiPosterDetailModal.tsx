import { useEffect, useMemo } from 'react'
import { Share2, X } from 'lucide-react'
import type { AiTopicInspiration } from '@/types/aiTopic'
import {
  AI_POSTER_INSPIRATION_MEDIA,
  getAiPosterInspirationMediaKey,
} from '@/data/aiPosterInspirationMedia'
import { coverFallback } from '@/utils'

import '@/styles/ai-poster-detail.css'

type DetailContext = {
  sectionTitle: string
  cardIndex: number
  item: AiTopicInspiration
}

function resolvePosterUrl(item: AiTopicInspiration, sectionTitle: string, cardIndex: number) {
  const key = getAiPosterInspirationMediaKey(sectionTitle, cardIndex)
  const fallback = AI_POSTER_INSPIRATION_MEDIA[key]?.poster
  const apiUrl = item.coverUrl?.startsWith('//') ? `https:${item.coverUrl}` : item.coverUrl
  if (apiUrl?.includes('chuangkit.com')) return apiUrl
  return fallback ?? apiUrl ?? coverFallback(`poster-detail-${item.id}`, 720, 960)
}

export function AiPosterDetailModal({
  open,
  context,
  onClose,
  onMakeSame,
}: {
  open: boolean
  context: DetailContext | null
  onClose: () => void
  onMakeSame: (item: AiTopicInspiration) => void
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  const posterUrl = useMemo(() => {
    if (!context) return ''
    return resolvePosterUrl(context.item, context.sectionTitle, context.cardIndex)
  }, [context])

  if (!open || !context) return null

  const { item } = context

  return (
    <div className="ai-poster-detail" role="dialog" aria-modal="true" aria-label={item.title}>
      <button type="button" className="ai-poster-detail__mask" aria-label="关闭" onClick={onClose} />
      <div className="ai-poster-detail__modal">
        <button type="button" className="ai-poster-detail__close" onClick={onClose} aria-label="关闭">
          <X className="h-5 w-5" />
        </button>

        <div className="ai-poster-detail__body">
          <div className="ai-poster-detail__preview">
            <img src={posterUrl} alt={item.title} />
          </div>

          <aside className="ai-poster-detail__aside">
            <h2 className="ai-poster-detail__title">{item.title}</h2>
            <p className="ai-poster-detail__prompt">
              {item.promptText?.trim() || `生成${item.title}`}
            </p>

            <div className="ai-poster-detail__actions">
              <button type="button" className="ai-poster-detail__share">
                <Share2 className="h-4 w-4" />
                分享
              </button>
              <button
                type="button"
                className="ai-poster-detail__primary"
                onClick={() => onMakeSame(item)}
              >
                做同款
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
