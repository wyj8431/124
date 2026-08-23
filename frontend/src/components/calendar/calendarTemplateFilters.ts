import type { DesignTemplate } from '@/types'

export interface CalendarSceneTab {
  code: string
  label: string
}

export const CALENDAR_SCENE_TABS: CalendarSceneTab[] = [
  { code: 'recommend', label: '推荐' },
  { code: 'mobile_poster', label: '手机海报' },
  { code: 'wechat_cover', label: '公众号首图' },
  { code: 'vertical_poster', label: '竖版海报' },
  { code: 'long_poster', label: '长图海报' },
  { code: 'horizontal_poster', label: '横版海报' },
  { code: 'wechat_sub', label: '公众号次图' },
  { code: 'fullscreen_poster', label: '全屏海报' },
  { code: 'square_poster', label: '方形海报' },
  { code: 'xiaohongshu', label: '小红书配图' },
  { code: 'moments_cover', label: '朋友圈封面' },
  { code: 'vertical_illustration', label: '竖版插画' },
  { code: 'illustration', label: '插画元素' },
]

/** 设计场景 ID，与 backend data.sql 插入顺序一致 */
const SCENE_ID = {
  xiaohongshu: 4,
  wechat_cover: 5,
  fullscreen_poster: 6,
  mobile_poster: 10,
  long_poster: 12,
  horizontal_poster: 16,
  video_cover: 17,
} as const

function ratio(t: DesignTemplate) {
  return t.width / t.height
}

export function filterCalendarTemplates(templates: DesignTemplate[], tabCode: string) {
  if (tabCode === 'recommend') return templates

  return templates.filter((t) => {
    const r = ratio(t)
    switch (tabCode) {
      case 'mobile_poster':
        return (
          t.sceneId === SCENE_ID.mobile_poster ||
          t.tags?.includes('手机海报') ||
          (t.sceneId === SCENE_ID.fullscreen_poster && t.height > t.width && r <= 0.65)
        )
      case 'wechat_cover':
        return t.sceneId === SCENE_ID.wechat_cover || r >= 2
      case 'vertical_poster':
        return t.height > t.width && r <= 0.85
      case 'long_poster':
        return t.sceneId === SCENE_ID.long_poster || t.height / t.width >= 2
      case 'horizontal_poster':
        return t.sceneId === SCENE_ID.horizontal_poster || (t.width > t.height && r >= 1.2)
      case 'wechat_sub':
        return r >= 1.4 && r < 2.2 && t.height < 600
      case 'fullscreen_poster':
        return t.sceneId === SCENE_ID.fullscreen_poster
      case 'square_poster':
        return Math.abs(r - 1) <= 0.15
      case 'xiaohongshu':
        return t.sceneId === SCENE_ID.xiaohongshu || (r > 0.65 && r < 0.85 && t.height >= 1200)
      case 'moments_cover':
        return r >= 0.9 && r <= 1.1 && t.width >= 1000
      case 'vertical_illustration':
        return t.height > t.width && t.tags?.includes('插画')
      case 'illustration':
        return Boolean(t.tags?.includes('插画') || t.tags?.includes('元素'))
      default:
        return true
    }
  })
}
