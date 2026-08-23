import { useState } from 'react'
import type { AiTopicInspiration } from '@/types/aiTopic'
import {
  AI_POSTER_INSPIRATION_MEDIA,
  getAiPosterInspirationMediaKey,
} from '@/data/aiPosterInspirationMedia'
import { coverFallback } from '@/utils'

function resolveMediaUrl(url?: string) {
  if (!url) return undefined
  return url.startsWith('//') ? `https:${url}` : url
}

export function InspirationImageCard({
  item,
  onClick,
  sectionTitle,
  cardIndex,
}: {
  item: AiTopicInspiration
  onClick: () => void
  sectionTitle: string
  cardIndex: number
}) {
  const [posterFailed, setPosterFailed] = useState(false)

  const fallbackKey = getAiPosterInspirationMediaKey(sectionTitle, cardIndex)
  const fallbackMedia = AI_POSTER_INSPIRATION_MEDIA[fallbackKey]
  const apiPoster = resolveMediaUrl(item.coverUrl)
  const poster =
    apiPoster?.includes('chuangkit.com') ? apiPoster : fallbackMedia?.poster ?? apiPoster
  const fallbackPoster = coverFallback(`poster-${item.id}`, 178, 253)
  const displayPoster = !posterFailed && poster ? poster : fallbackPoster

  return (
    <button type="button" className="popular-inspiration__card l-inspiration-item" onClick={onClick}>
      <div className="popular-inspiration__card-content">
        <div className="popular-inspiration__card-image-wrapper">
          <div className="popular-inspiration__card-image-container">
            <img
              src={displayPoster}
              alt={item.title}
              className="popular-inspiration__card-media"
              loading="lazy"
              onError={() => setPosterFailed(true)}
            />
            <span className="popular-inspiration__card-watermark is-visible" aria-hidden>
              AI 生成
            </span>
          </div>
        </div>
        <div className="popular-inspiration__card-title-wrapper">
          <p className="popular-inspiration__card-title">{item.title}</p>
        </div>
      </div>
    </button>
  )
}
