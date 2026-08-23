export interface ApiResult<T> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface SearchTab {
  id: number
  name: string
  code: string
  placeholder: string
  sortOrder: number
}

export interface HomeTab {
  id: number
  name: string
  code: string
  sortOrder: number
}

export interface HotTag {
  id: number
  name: string
  emoji?: string
  searchKeyword: string
}

export interface DesignScene {
  id: number
  name: string
  code: string
  icon?: string
  subtitle?: string
  previewUrl?: string
  width: number
  height: number
  category: string
}

export interface HomeFeature {
  id: number
  title: string
  subtitle: string
  coverUrl: string
  linkType: string
  linkValue: string
  tabCode: string
}

export interface DesignTemplate {
  id: number
  title: string
  coverUrl: string
  previewUrl?: string
  sceneId: number
  categoryId: number
  width: number
  height: number
  canvasJson?: string
  tags?: string
  useCount: number
  isFree: number
  isHot: number
  isRecommend: number
}

export interface RecommendTemplate extends DesignTemplate {
  liked?: boolean
  likeCount?: number
}

export interface CalendarEvent {
  id: number
  name: string
  eventDate: string
  dateLabel?: string
  weekday: string
  daysLeft: number
  categoryCode?: string
  description?: string
  coverUrl?: string
}

export interface CalendarCategory {
  id: number
  name: string
  code: string
  sortOrder: number
}

export interface CalendarToday {
  day: number
  yearMonth: string
  weekday: string
  lunarDate: string
}

export interface CalendarIndexData {
  categories: CalendarCategory[]
  today: CalendarToday
  events: CalendarEvent[]
}

export interface EditorCollection {
  id: number
  title: string
  subtitle: string
  coverUrl: string
  coverUrlHover: string
  categoryCode?: string
  templateCount: number
  previewUrls?: string[]
}

export interface TemplateCategory {
  id: number
  name: string
  code: string
  parentId: number
  sortOrder: number
}

export interface HomeSection {
  id: number
  title: string
  subtitle: string
  code: string
  templates: DesignTemplate[]
  cards?: HomeSectionCard[]
}

export interface HomeSectionCard {
  id: number
  label: string
  templateId: number
  title: string
  coverUrl: string
  width?: number
  height?: number
  isFree?: number
}

export interface HomeIndexData {
  searchTabs: SearchTab[]
  homeTabs: HomeTab[]
  hotTags: HotTag[]
  scenes: DesignScene[]
  quickStartScenes: DesignScene[]
  featureCards: HomeFeature[]
  recommendTemplates: DesignTemplate[]
  calendarEvents: CalendarEvent[]
  editorCollections: EditorCollection[]
  sections: HomeSection[]
}

export interface MemberPlanItem {
  id: number
  name: string
  description: string
  iconStyle: 'blue' | 'orange' | 'enterprise' | string
  linkUrl?: string
}

export interface MemberPlanGroup {
  code: string
  title: string
  subtitle: string
  plans: MemberPlanItem[]
}

export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar?: string
  memberLevel: number
  memberLevelName: string
}

export interface AccountPanelData {
  user: {
    id: number
    displayName: string
    avatar?: string
    roleLabel: string
    userIdLabel: string
  }
  member: {
    levelName: string
    title: string
    subtitle: string
    ctaText: string
    ctaLink: string
  }
  storage: {
    usedBytes: number
    totalBytes: number
    usedLabel: string
    totalLabel: string
    percent: number
  }
  aiCredits: {
    balance: number
    tip: string
  }
  accountSwitcher: {
    displayName: string
    versionLabel: string
    createTeamText: string
    trialBadge: string
  }
  menuItems: Array<{
    code: string
    name: string
    icon: string
    routePath?: string | null
  }>
}

export interface AuthResponse {
  token: string
  user: UserInfo
}

export interface UserDesign {
  id: number
  title: string
  coverUrl?: string
  sceneId?: number
  templateId?: number
  width?: number
  height?: number
  canvasJson?: string
  status?: number
  updateTime?: string
}

export interface RecentUsageItem {
  id: number
  targetType: 'scene' | 'template' | string
  targetId: number
  name: string
  icon?: string
  coverUrl?: string
}

export interface AiOption {
  code: string
  name: string
}

export interface AiPromptTag {
  name: string
  keyword: string
}

export interface AiModeConfig {
  mode: string
  models: AiOption[]
  aspectRatios: AiOption[]
  styles: AiOption[]
  promptTags: AiPromptTag[]
}

export interface AiGenerateResult {
  taskId: number
  status: number
  mode: string
  outputType: 'image' | 'video' | 'agent'
  outputUrl: string
  previewUrl?: string
  duration?: string
  message: string
  toolName?: string
  steps?: { code: string; title: string; detail: string }[]
}
