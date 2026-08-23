import {
  AI_VIDEO_INSPIRATION_MEDIA,
  getAiVideoInspirationMediaKey,
} from '@/data/aiVideoInspirationMedia'
import type { AiTopicInspiration } from '@/types/aiTopic'

function resolveMediaUrl(url?: string) {
  if (!url) return undefined
  return url.startsWith('//') ? `https:${url}` : url
}

export function resolveInspirationMedia(
  item: AiTopicInspiration,
  sectionTitle: string,
  cardIndex: number,
) {
  const fallbackKey = getAiVideoInspirationMediaKey(sectionTitle, cardIndex)
  const fallbackMedia = AI_VIDEO_INSPIRATION_MEDIA[fallbackKey]
  const apiPoster = resolveMediaUrl(item.coverUrl)
  const poster =
    apiPoster?.includes('chuangkit.com') ? apiPoster : fallbackMedia?.poster ?? apiPoster
  const apiVideo = resolveMediaUrl(item.coverHoverUrl)
  const videoUrl =
    (apiVideo?.includes('sign=') ? apiVideo : undefined) ?? fallbackMedia?.video ?? apiVideo

  return { poster, videoUrl }
}

export function findInspirationContext(
  sections: { title: string; items: AiTopicInspiration[] }[],
  id: number,
) {
  for (const section of sections) {
    const index = section.items.findIndex((item) => item.id === id)
    if (index >= 0) {
      return {
        sectionTitle: section.title,
        cardIndex: index,
        item: section.items[index],
        siblings: section.items,
      }
    }
  }
  return null
}
