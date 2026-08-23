import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { Play } from 'lucide-react'
import type { AiTopicInspiration } from '@/types/aiTopic'
import { AI_VIDEO_INSPIRATION_MEDIA, getAiVideoInspirationMediaKey } from '@/data/aiVideoInspirationMedia'
import { coverFallback } from '@/utils'

function resolveMediaUrl(url?: string) {
  if (!url) return undefined
  return url.startsWith('//') ? `https:${url}` : url
}

export function InspirationVideoCard({
  item,
  onClick,
  scrollRootRef,
  sectionTitle,
  cardIndex,
  canAutoPlay = false,
}: {
  item: AiTopicInspiration
  onClick: () => void
  scrollRootRef?: RefObject<HTMLElement | null>
  sectionTitle: string
  cardIndex: number
  canAutoPlay?: boolean
}) {
  const cardRef = useRef<HTMLButtonElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const shouldPlayRef = useRef(false)
  const [posterFailed, setPosterFailed] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const fallbackKey = getAiVideoInspirationMediaKey(sectionTitle, cardIndex)
  const fallbackMedia = AI_VIDEO_INSPIRATION_MEDIA[fallbackKey]
  const apiPoster = resolveMediaUrl(item.coverUrl)
  const poster =
    apiPoster?.includes('chuangkit.com') ? apiPoster : fallbackMedia?.poster ?? apiPoster
  const apiVideo = resolveMediaUrl(item.coverHoverUrl)
  const videoUrl =
    (apiVideo?.includes('sign=') ? apiVideo : undefined) ?? fallbackMedia?.video ?? apiVideo
  const fallbackPoster = coverFallback(`insp-${item.id}`, 178, 253)
  const displayPoster = !posterFailed && poster ? poster : fallbackPoster
  const isPlaying = hovering || (canAutoPlay && isVisible)

  const tryPlay = useCallback(async () => {
    const video = videoRef.current
    if (!video || !shouldPlayRef.current) return

    video.muted = true
    try {
      if (video.readyState === 0) {
        video.load()
      }
      await video.play()
    } catch {
      /* ignore autoplay errors */
    }
  }, [])

  const tryPause = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.currentTime = 0
  }, [])

  useEffect(() => {
    shouldPlayRef.current = isPlaying
    if (isPlaying) {
      void tryPlay()
    } else {
      tryPause()
    }
  }, [isPlaying, tryPlay, tryPause])

  useEffect(() => {
    const el = cardRef.current
    if (!el || !videoUrl) return

    const root = scrollRootRef?.current ?? null
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.2)
      },
      { root, threshold: [0, 0.2, 0.5, 1] },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [videoUrl, scrollRootRef])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return

    const onReady = () => {
      if (shouldPlayRef.current) void tryPlay()
    }

    video.addEventListener('loadeddata', onReady)
    video.addEventListener('canplay', onReady)
    return () => {
      video.removeEventListener('loadeddata', onReady)
      video.removeEventListener('canplay', onReady)
    }
  }, [videoUrl, tryPlay])

  return (
    <button
      ref={cardRef}
      type="button"
      className="popular-inspiration__card l-inspiration-item"
      onClick={onClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="popular-inspiration__card-content">
        <div className="popular-inspiration__card-image-wrapper">
          <div className="popular-inspiration__card-image-container">
            {videoUrl ? (
              <video
                ref={videoRef}
                className={`popular-inspiration__card-media popular-inspiration__card-video${isPlaying ? ' is-playing' : ''}`}
                src={videoUrl}
                poster={displayPoster}
                muted
                loop
                playsInline
                preload={canAutoPlay ? 'auto' : 'metadata'}
                disablePictureInPicture
              />
            ) : (
              <img
                src={displayPoster}
                alt={item.title}
                className="popular-inspiration__card-media"
                loading="lazy"
                onError={() => setPosterFailed(true)}
              />
            )}

            {!isPlaying && videoUrl && (
              <span className="popular-inspiration__card-play-badge" aria-hidden>
                <Play className="h-3 w-3 fill-white text-white" />
              </span>
            )}

            {videoUrl && (
              <span
                className={`popular-inspiration__card-watermark${isPlaying ? ' is-visible' : ''}`}
                aria-hidden
              >
                AI 生成
              </span>
            )}
          </div>
        </div>
        <div className="popular-inspiration__card-title-wrapper">
          <p className="popular-inspiration__card-title">{item.title}</p>
        </div>
      </div>
    </button>
  )
}
