export interface AiTopicPreset {
  id: number
  title: string
  coverUrl: string
  promptText: string
  cardRotateDeg: number
  cardOffsetX: number
  cardZIndex: number
}

export interface AiTopicInspiration {
  id: number
  title: string
  coverUrl: string
  coverHoverUrl?: string /** 视频预览地址 */
  promptText: string
}

export interface AiTopicSection {
  id: number
  title: string
  emoji?: string
  displayTitle: string
  moreText: string
  moreLink?: string
  items: AiTopicInspiration[]
}

export interface AiTopicIndexData {
  code: string
  title: string
  breadcrumbParent: string
  breadcrumbParentUrl: string
  promptPlaceholder: string
  generateButtonText: string
  presets: AiTopicPreset[]
  sections: AiTopicSection[]
}
