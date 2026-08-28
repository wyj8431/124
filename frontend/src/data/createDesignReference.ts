import type { CreateDesignNavItem, CreateDesignSizeTab } from '@/types/createDesign'
import type { DesignScene } from '@/types'

/**
 * The create dialog is a visual entry point, so its first-view navigation and
 * imagery stay aligned with the supplied reference instead of changing with
 * live catalog content.
 */
export const REFERENCE_NAV_ITEMS: CreateDesignNavItem[] = [
  { id: 1, name: '精选推荐', code: 'recommend', sortOrder: 1 },
  { id: 2, name: '智能设计', code: 'smart', sortOrder: 2 },
  { id: 3, name: '海报', code: 'poster', sortOrder: 3 },
  { id: 4, name: '抖音/小红书', code: 'douyin', sortOrder: 4 },
  { id: 5, name: '微信', code: 'wechat', sortOrder: 5 },
  { id: 6, name: '电商', code: 'ecommerce', sortOrder: 6 },
  { id: 7, name: 'PPT', code: 'ppt', sortOrder: 7 },
  { id: 8, name: '印刷/办公', code: 'print', sortOrder: 8 },
  { id: 9, name: 'H5', code: 'h5', sortOrder: 9 },
]

export const REFERENCE_SIZE_TABS: CreateDesignSizeTab[] = [
  { id: 1, name: '常用', code: 'common', sortOrder: 1 },
  { id: 2, name: '收藏', code: 'favorite', sortOrder: 2 },
  { id: 3, name: 'PC端', code: 'pc', sortOrder: 3 },
  { id: 4, name: '移动端', code: 'mobile', sortOrder: 4 },
  { id: 5, name: '印刷', code: 'print', sortOrder: 5 },
]

export const REFERENCE_SCENE_MEDIA: Record<string, string> = {
  long_poster: '/create-design/reference/preset-long.jpg',
  mobile_poster: '/create-design/reference/preset-mobile.jpg',
  fullscreen_poster: '/create-design/reference/preset-fullscreen.jpg',
  horizontal_poster: '/create-design/reference/preset-horizontal.jpg',
  invitation: '/create-design/reference/preset-invitation.jpg',
  xiaohongshu: '/create-design/reference/preset-xiaohongshu.jpg',
}

export const REFERENCE_TEMPLATE_MEDIA = [
  '/create-design/reference/template-01.jpg',
  '/create-design/reference/template-02.jpg',
  '/create-design/reference/template-03.jpg',
  '/create-design/reference/template-04.jpg',
]

/** Used only as a no-network fallback while the catalog request is unavailable. */
export const REFERENCE_SCENES: DesignScene[] = [
  { id: 12, name: '长图海报', code: 'long_poster', width: 800, height: 2000, category: 'marketing', previewUrl: REFERENCE_SCENE_MEDIA.long_poster },
  { id: 10, name: '手机海报', code: 'mobile_poster', width: 1080, height: 1920, category: 'marketing', previewUrl: REFERENCE_SCENE_MEDIA.mobile_poster },
  { id: 6, name: '全屏海报', code: 'fullscreen_poster', width: 1080, height: 1920, category: 'marketing', previewUrl: REFERENCE_SCENE_MEDIA.fullscreen_poster },
  { id: 16, name: '横版海报', code: 'horizontal_poster', width: 1920, height: 1080, category: 'marketing', previewUrl: REFERENCE_SCENE_MEDIA.horizontal_poster },
  { id: 13, name: '邀请函', code: 'invitation', width: 1080, height: 1920, category: 'marketing', previewUrl: REFERENCE_SCENE_MEDIA.invitation },
]
