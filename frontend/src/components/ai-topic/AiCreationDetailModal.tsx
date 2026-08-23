import { useEffect, useMemo, useRef } from 'react'
import { Share2, Sparkles, X } from 'lucide-react'
import type { AiTopicInspiration } from '@/types/aiTopic'
import { getInspirationDetailScript, isLongFormScript } from '@/data/aiVideoInspirationScripts'
import { resolveInspirationMedia } from '@/utils/inspirationMedia'

import '@/styles/ai-creation-detail.css'

const DEFAULT_AUTHOR = {
  name: '你很会演呀',
  avatar:
    'https://pub-cdn-oss.chuangkit.com/userHead/108008520?imageMogr2/ignore-error/1/thumbnail/160x%3E?v=1753684343060',
}

type DetailContext = {
  sectionTitle: string
  cardIndex: number
  item: AiTopicInspiration
  siblings: AiTopicInspiration[]
}

export function AiCreationDetailModal({
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
  const videoRef = useRef<HTMLVideoElement>(null)

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

  const activeContext = useMemo(() => {
    if (!context) return null
    return {
      sectionTitle: context.sectionTitle,
      cardIndex: context.cardIndex,
      item: context.item,
    }
  }, [context])

  const media = useMemo(() => {
    if (!activeContext) return null
    return resolveInspirationMedia(
      activeContext.item,
      activeContext.sectionTitle,
      activeContext.cardIndex,
    )
  }, [activeContext])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !open) return
    video.muted = true
    void video.play().catch(() => undefined)
  }, [open, media?.videoUrl])

  if (!open || !activeContext || !media) return null

  const { item, sectionTitle, cardIndex } = activeContext
  const script = getInspirationDetailScript(
    sectionTitle,
    cardIndex,
    item.promptText?.trim() || '暂无脚本内容',
  )
  const longScript = isLongFormScript(script)
  const understandText = sectionTitle.includes('短剧')
    ? '我已理解您的短剧视频生成需求，将按照您提供的分镜头脚本和9:16比例要求生成对应的视频。'
    : '我已理解您的短视频生成需求，将按照您提供的分镜头脚本和9:16比例要求生成对应的视频。'

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}?id=${item.id}&aiMode=agent&agentDetail=1`
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      alert('链接已复制')
    } catch {
      alert('分享失败，请稍后重试')
    }
  }

  return (
    <div className="ai-creation-detail ai-creation-detail--visible" role="dialog" aria-modal="true">
      <button type="button" className="ai-creation-detail__mask" aria-label="关闭详情" onClick={onClose} />
      <button type="button" className="ai-creation-detail__close" aria-label="关闭" onClick={onClose}>
        <X className="h-4 w-4 text-white" />
      </button>

      <div className="ai-creation-detail__modal">
        <div className="ai-creation-detail__body">
          <section className="detail-left">
            <div className="detail-left__top">
              <div className="detail-left__title">{item.title}</div>
              <div className="detail-left__actions">
                <button type="button" className="detail-left__btn" onClick={() => void handleShare()}>
                  <Share2 className="h-3.5 w-3.5" />
                  分享
                </button>
                <button
                  type="button"
                  className="detail-left__btn detail-left__btn--primary"
                  onClick={() => onMakeSame(item)}
                >
                  做同款
                </button>
              </div>
            </div>

            <div className="detail-preview-area">
              <div className="detail-main-image-wrap">
                <div className="detail-main-video-shell">
                  {media.videoUrl ? (
                    <video
                      ref={videoRef}
                      key={media.videoUrl}
                      className="detail-main-video"
                      src={media.videoUrl}
                      poster={media.poster}
                      muted
                      loop
                      playsInline
                      autoPlay
                      controls={false}
                    />
                  ) : (
                    <img src={media.poster} alt={item.title} className="detail-main-video" />
                  )}
                  <span className="detail-main-video__badge">AI 生成</span>
                </div>
              </div>
            </div>
          </section>

          <aside className="detail-right">
            <div className="detail-agent-chat">
              <div className="detail-agent-chat__header">
                <img src={DEFAULT_AUTHOR.avatar} alt="" className="detail-agent-chat__avatar" />
                <span className="detail-agent-chat__name">{DEFAULT_AUTHOR.name}</span>
              </div>

              <div className="detail-agent-chat__scroll">
                <div className="detail-agent-chat__user-block">
                  {longScript ? (
                    <div className="detail-agent-chat__script">{script}</div>
                  ) : (
                    <div className="detail-agent-chat__user-prompt">{script}</div>
                  )}
                </div>

                <div className="detail-agent-chat__assistant">{understandText}</div>
                <div className="detail-agent-chat__assistant">
                  开始处理您的根据分镜头脚本生成9:16短视频需求！
                </div>

                <div className="detail-agent-task">
                  <div className="detail-agent-task__head">
                    <span className="detail-agent-task__title">
                      <Sparkles className="h-3.5 w-3.5" />
                      视频生成
                    </span>
                    <span className="detail-agent-task__model">Seedance 2.0</span>
                  </div>
                  <div className="detail-agent-task__preview">
                    {media.videoUrl ? (
                      <video
                        src={media.videoUrl}
                        poster={media.poster}
                        muted
                        loop
                        playsInline
                        autoPlay
                      />
                    ) : (
                      <img src={media.poster} alt={item.title} />
                    )}
                  </div>
                </div>

                <div className="detail-agent-chat__status">
                  <Sparkles className="h-3.5 w-3.5" />
                  已完成当前任务
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
