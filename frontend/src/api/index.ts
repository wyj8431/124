import axios from 'axios'
import type {
  ApiResult,
  AuthResponse,
  HomeIndexData,
  HomeFeature,
  PageResult,
  CalendarIndexData,
  DesignTemplate,
  TemplateCategory,
  MemberPlanGroup,
  UserInfo,
  UserDesign,
} from '@/types'
import type {
  TemplateCenterIndexData,
  TemplateCenterListResult,
  TemplateCenterQuery,
} from '@/types/templateCenter'
import type {
  CreateDesignIndexData,
  CreateDesignQuery,
} from '@/types/createDesign'
import type {
  MyDesignIndexData,
  MyDesignItem,
  MyDesignQuery,
  MyFavoriteItem,
  MyDesignFolder,
} from '@/types/myDesign'

export class ApiError extends Error {
  readonly code: number

  constructor(message: string, code: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

const api = axios.create({
  baseURL: '/admin',
  timeout: 15000,
})

let refreshPromise: Promise<string> | null = null

function saveAuthTokens(token: string, refreshToken?: string) {
  localStorage.setItem('ckt_token', token)
  if (refreshToken) localStorage.setItem('ckt_refresh_token', refreshToken)
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ckt_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => {
    const body = res.data as ApiResult<unknown>
    if (body.code !== 200) {
      return Promise.reject(new ApiError(body.message || '请求失败', body.code))
    }
    return res
  },
  async (err) => {
    const original = err.config as (typeof err.config & { _retry?: boolean }) | undefined
    const status = err.response?.status
    const refreshToken = localStorage.getItem('ckt_refresh_token')
    if (status === 401 && original && !original._retry && refreshToken && !String(original.url).includes('/auth/refresh')) {
      original._retry = true
      refreshPromise ??= axios
        .post<ApiResult<import('@/types').AuthResponse>>('/admin/auth/refresh', { refreshToken })
        .then((response) => {
          const next = response.data.data
          saveAuthTokens(next.token, next.refreshToken)
          return next.token
        })
        .finally(() => { refreshPromise = null })
      try {
        original.headers = original.headers ?? {}
        original.headers.Authorization = `Bearer ${await refreshPromise}`
        return api.request(original)
      } catch {
        localStorage.removeItem('ckt_token')
        localStorage.removeItem('ckt_refresh_token')
        window.dispatchEvent(new Event('ckt-auth-expired'))
      }
    }
    const response = err.response?.data as Partial<ApiResult<unknown>> | undefined
    const msg = response?.message
    return Promise.reject(new ApiError(msg || err.message || '网络请求失败', response?.code || err.response?.status || 500))
  },
)

function unwrap<T>(res: { data: ApiResult<T> }): T {
  return res.data.data
}

export const homeApi = {
  getIndex: () => api.get<ApiResult<HomeIndexData>>('/home/index').then(unwrap),
  getFeatures: (tabCode: string) =>
    api.get<ApiResult<HomeFeature[]>>(`/home/features?tabCode=${tabCode}`).then(unwrap),
  getCategories: () =>
    api.get<ApiResult<TemplateCategory[]>>('/categories').then(unwrap),
  getRecentDesigns: (limit = 12) =>
    api.get<ApiResult<UserDesign[]>>(`/home/recent-designs?limit=${limit}`).then(unwrap),
  getRecentUsage: (limit = 8) =>
    api.get<ApiResult<import('@/types').RecentUsageItem[]>>(`/home/recent-usage?limit=${limit}`).then(unwrap),
  getSection: (code: string) =>
    api
      .get<ApiResult<import('@/types').HomeSection & { cards: import('@/types').HomeSectionCard[] }>>(
        `/home/sections/${code}`,
      )
      .then(unwrap),
}

export const collectionApi = {
  list: () =>
    api.get<ApiResult<import('@/types').EditorCollection[]>>('/collections').then(unwrap),
  getTemplates: (id: number, limit = 12) =>
    api
      .get<ApiResult<DesignTemplate[]>>(`/collections/${id}/templates`, { params: { limit } })
      .then(unwrap),
}

export const calendarApi = {
  getIndex: () =>
    api.get<ApiResult<CalendarIndexData>>('/calendar/index').then(unwrap),
  getEvents: (categories: string[]) =>
    api
      .get<ApiResult<CalendarIndexData['events']>>('/calendar/events', {
        params: { categories: categories.join(',') },
      })
      .then(unwrap),
  getEventTemplates: (eventId: number, limit = 48, scene?: string) =>
    api
      .get<ApiResult<DesignTemplate[]>>(`/calendar/events/${eventId}/templates`, {
        params: { limit, scene },
      })
      .then(unwrap),
}

export const memberApi = {
  getPlans: () =>
    api.get<ApiResult<MemberPlanGroup[]>>('/member/plans').then(unwrap),
  getCheckoutIndex: () =>
    api.get<ApiResult<import('@/types/membership').MembershipCheckoutData>>('/member/checkout/index').then(unwrap),
  createOrder: (data: { skuId: number; seatCount: number; payMethod: string }) =>
    api.post<ApiResult<import('@/types/membership').MemberOrderData>>('/member/checkout/order', data).then(unwrap),
  getOrderStatus: (orderId: number) =>
    api.get<ApiResult<import('@/types/membership').MemberOrderData>>(`/member/checkout/order/${orderId}/status`).then(unwrap),
  simulatePay: (orderId: number) =>
    api.post<ApiResult<import('@/types/membership').MemberOrderData>>(`/member/checkout/order/${orderId}/simulate-pay`).then(unwrap),
}

export const templateCenterApi = {
  getIndex: () =>
    api.get<ApiResult<TemplateCenterIndexData>>('/template-center/index').then(unwrap),
  listTemplates: (params: TemplateCenterQuery) =>
    api
      .get<ApiResult<TemplateCenterListResult>>('/template-center/templates', { params })
      .then(unwrap),
}

export const templateApi = {
  list: (page = 1, pageSize = 24, categoryId?: number) =>
    api
      .get<ApiResult<PageResult<DesignTemplate>>>('/templates', {
        params: { page, pageSize, categoryId },
      })
      .then(unwrap),
  search: (keyword: string, page = 1, pageSize = 24) =>
    api
      .get<ApiResult<PageResult<DesignTemplate>>>('/templates/search', {
        params: { keyword, page, pageSize },
      })
      .then(unwrap),
  recommend: (limit = 12) =>
    api
      .get<ApiResult<import('@/types').RecommendTemplate[]>>(`/templates/recommend?limit=${limit}`)
      .then(unwrap),
  use: (id: number) => api.post(`/templates/${id}/use`),
  view: (id: number) => api.post(`/templates/${id}/view`),
  like: (id: number) =>
    api
      .post<ApiResult<{ liked: boolean; likeCount: number }>>(`/templates/${id}/like`)
      .then(unwrap),
  referenceGenerate: (id: number) =>
    api
      .post<ApiResult<import('@/types').AiGenerateResult & { templateId: number; templateTitle: string }>>(
        `/templates/${id}/reference-generate`,
      )
      .then(unwrap),
}

export const authApi = {
  login: (username: string, password: string) =>
    api
      .post<ApiResult<AuthResponse>>('/auth/login', { username, password })
      .then(unwrap),
  loginByWechat: (code: string) =>
    api.post<ApiResult<AuthResponse>>('/auth/wechat/login', { code }).then(unwrap),
  register: (username: string, password: string, nickname?: string) =>
    api
      .post<ApiResult<AuthResponse>>('/auth/register', { username, password, nickname })
      .then(unwrap),
  sendSms: (phone: string) =>
    api
      .post<ApiResult<{ message: string; realSms: boolean; debugCode?: string }>>('/auth/sms/send', { phone })
      .then(unwrap),
  registerByPhone: (data: {
    phone: string
    smsCode: string
    password: string
    confirmPassword: string
  }) =>
    api.post<ApiResult<AuthResponse>>('/auth/register/phone', data).then(unwrap),
  sendResetSms: (phone: string) =>
    api
      .post<ApiResult<{ message: string; realSms: boolean; debugCode?: string }>>('/auth/sms/send-reset', {
        phone,
      })
      .then(unwrap),
  resetPassword: (data: {
    phone: string
    smsCode: string
    password: string
    confirmPassword: string
  }) => api.post<ApiResult<AuthResponse>>('/auth/password/reset', data).then(unwrap),
  profile: () => api.get<ApiResult<UserInfo>>('/user/profile').then(unwrap),
  accountPanel: () => api.get<ApiResult<import('@/types').AccountPanelData>>('/user/account-panel').then(unwrap),
}

export const createDesignApi = {
  getIndex: () =>
    api.get<ApiResult<CreateDesignIndexData>>('/create-design/index').then(unwrap),
  listScenes: (params: Pick<CreateDesignQuery, 'navCode' | 'sizeTabCode' | 'keyword'>) =>
    api
      .get<ApiResult<import('@/types').DesignScene[]>>('/create-design/scenes', { params })
      .then(unwrap),
  listTemplates: (params: CreateDesignQuery) =>
    api
      .get<ApiResult<PageResult<import('@/types').DesignTemplate>>>('/create-design/templates', {
        params,
      })
      .then(unwrap),
}

export const designApi = {
  list: (page = 1, pageSize = 24) =>
    api
      .get<ApiResult<PageResult<UserDesign>>>('/designs', { params: { page, pageSize } })
      .then(unwrap),
  create: (data: {
    templateId?: number
    templateTitle?: string
    templateCoverUrl?: string
    sceneId?: number
    title?: string
    width?: number
    height?: number
    unit?: string
  }) => api.post<ApiResult<UserDesign>>('/designs', data).then(unwrap),
  getById: (id: number) => api.get<ApiResult<UserDesign>>(`/designs/${id}`).then(unwrap),
  save: (id: number, data: {
    title?: string
    canvasJson?: string
    revision?: number
    coverUrl?: string
    width?: number
    height?: number
    status?: number
    shareToken?: string
  }) => {
    const { shareToken, ...body } = data
    return api.put<ApiResult<UserDesign>>(`/designs/${id}`, body, { params: shareToken ? { shareToken } : undefined }).then(unwrap)
  },
  remove: (id: number) => api.delete<ApiResult<void>>(`/designs/${id}`).then(unwrap),
}

export const designShareApi = {
  create: (designId: number, mode: 'readonly' | 'editable', expireDays = 30) =>
    api.post<ApiResult<import('@/types/designShare').DesignShareLink>>(`/design-shares/designs/${designId}`, { mode, expireDays }).then(unwrap),
  resolve: (token: string) =>
    api.get<ApiResult<import('@/types/designShare').DesignShareAccess>>(`/design-shares/${encodeURIComponent(token)}`).then(unwrap),
  revoke: (token: string) => api.delete<ApiResult<void>>(`/design-shares/${encodeURIComponent(token)}`).then(unwrap),
}

export const usageApi = {
  getQuota: () => api.get<ApiResult<import('@/types').UsageQuota>>('/usage/quota').then(unwrap),
  consume: (action: 'create' | 'save' | 'export') =>
    api.post<ApiResult<import('@/types').UsageQuota>>('/usage/consume', { action }).then(unwrap),
}

export const myDesignApi = {
  getIndex: () =>
    api.get<ApiResult<MyDesignIndexData>>('/my-design/index').then(unwrap),
  listDesigns: (params: MyDesignQuery) =>
    api
      .get<ApiResult<PageResult<MyDesignItem>>>('/my-design/designs', { params })
      .then(unwrap),
  listRecycle: (params: Pick<MyDesignQuery, 'page' | 'pageSize' | 'keyword'>) =>
    api
      .get<ApiResult<PageResult<MyDesignItem>>>('/my-design/recycle', { params })
      .then(unwrap),
  listFavorites: (params: Pick<MyDesignQuery, 'page' | 'pageSize' | 'keyword'>) =>
    api
      .get<ApiResult<PageResult<MyFavoriteItem>>>('/my-design/favorites', { params })
      .then(unwrap),
  rename: (id: number, title: string) =>
    api.put<ApiResult<MyDesignItem>>(`/my-design/designs/${id}/rename`, { title }).then(unwrap),
  move: (id: number, folderId: number | null) =>
    api.put<ApiResult<MyDesignItem>>(`/my-design/designs/${id}/move`, { folderId }).then(unwrap),
  delete: (id: number) => api.delete<ApiResult<void>>(`/my-design/designs/${id}`).then(unwrap),
  restore: (id: number) =>
    api.post<ApiResult<MyDesignItem>>(`/my-design/designs/${id}/restore`).then(unwrap),
  permanentDelete: (id: number) =>
    api.delete<ApiResult<void>>(`/my-design/designs/${id}/permanent`).then(unwrap),
  createFolder: (name: string) =>
    api.post<ApiResult<MyDesignFolder>>('/my-design/folders', { name }).then(unwrap),
  renameFolder: (id: number, name: string) =>
    api.put<ApiResult<MyDesignFolder>>(`/my-design/folders/${id}`, { name }).then(unwrap),
  deleteFolder: (id: number) =>
    api.delete<ApiResult<void>>(`/my-design/folders/${id}`).then(unwrap),
  unlike: (templateId: number) =>
    api.delete<ApiResult<void>>(`/my-design/favorites/${templateId}`).then(unwrap),
}

export const authRecordApi = {
  getIndex: () =>
    api.get<ApiResult<import('@/types/authRecord').AuthRecordIndexData>>('/auth-record/index').then(unwrap),
  listRecords: (params: {
    keyword?: string
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }) =>
    api
      .get<ApiResult<import('@/types/authRecord').AuthRecordListResult>>('/auth-record/records', { params })
      .then(unwrap),
  batchDownload: (data: { ids: number[]; latestOnly?: boolean }) =>
    api
      .post<ApiResult<import('@/types/authRecord').AuthRecordBatchDownloadResult>>(
        '/auth-record/records/batch-download',
        data,
      )
      .then(unwrap),
}

export const messageCenterApi = {
  getIndex: () =>
    api.get<ApiResult<import('@/types/messageCenter').MessageCenterIndexData>>('/message-center/index').then(unwrap),
  listMessages: (params: { category?: string; page?: number; pageSize?: number }) =>
    api
      .get<ApiResult<import('@/types/messageCenter').MessageCenterListResult>>('/message-center/messages', { params })
      .then(unwrap),
  getMessage: (id: number) =>
    api
      .get<ApiResult<import('@/types/messageCenter').MessageCenterMessage>>(`/message-center/messages/${id}`)
      .then(unwrap),
  markRead: (id: number) =>
    api
      .post<ApiResult<import('@/types/messageCenter').MessageCenterMessage>>(`/message-center/messages/${id}/read`)
      .then(unwrap),
  markAllRead: (category = 'all') =>
    api.post<ApiResult<number>>('/message-center/messages/read-all', null, { params: { category } }).then(unwrap),
}

export const couponCenterApi = {
  getIndex: () =>
    api.get<ApiResult<import('@/types/couponCenter').CouponCenterIndexData>>('/coupon-center/index').then(unwrap),
  listCoupons: (params: { status?: string; page?: number; pageSize?: number }) =>
    api
      .get<ApiResult<import('@/types/couponCenter').CouponCenterListResult>>('/coupon-center/coupons', { params })
      .then(unwrap),
}

export const orderCenterApi = {
  getIndex: () =>
    api.get<ApiResult<import('@/types/orderCenter').OrderCenterIndexData>>('/order-center/index').then(unwrap),
  listOrders: (params: { type: string; status?: string; page?: number; pageSize?: number }) =>
    api
      .get<ApiResult<PageResult<import('@/types/orderCenter').OrderCenterOrder>>>('/order-center/orders', { params })
      .then(unwrap),
  getOrder: (id: number) =>
    api.get<ApiResult<import('@/types/orderCenter').OrderCenterOrder>>(`/order-center/orders/${id}`).then(unwrap),
  payOrder: (id: number) =>
    api.post<ApiResult<import('@/types/membership').MemberOrderData>>(`/order-center/orders/${id}/pay`).then(unwrap),
  cancelOrder: (id: number) =>
    api.post<ApiResult<void>>(`/order-center/orders/${id}/cancel`).then(unwrap),
  listEligible: () =>
    api
      .get<ApiResult<import('@/types/orderCenter').OrderCenterOrder[]>>('/order-center/invoices/eligible')
      .then(unwrap),
  applyInvoice: (data: {
    invoiceType: string
    title: string
    taxNo?: string
    email: string
    remark?: string
    orderIds: number[]
  }) =>
    api.post<ApiResult<import('@/types/orderCenter').OrderCenterInvoice>>('/order-center/invoices', data).then(unwrap),
  listInvoices: (page = 1, pageSize = 20) =>
    api
      .get<ApiResult<PageResult<import('@/types/orderCenter').OrderCenterInvoice>>>('/order-center/invoices', {
        params: { page, pageSize },
      })
      .then(unwrap),
  listTransfers: (page = 1, pageSize = 20) =>
    api
      .get<ApiResult<PageResult<import('@/types/orderCenter').OrderCenterTransfer>>>('/order-center/transfers', {
        params: { page, pageSize },
      })
      .then(unwrap),
  submitTransfer: (data: { amountCents: number; payerName: string; remark?: string }) =>
    api
      .post<ApiResult<import('@/types/orderCenter').OrderCenterTransfer>>('/order-center/transfers', data)
      .then(unwrap),
  getBalance: (tab = 'all') =>
    api
      .get<ApiResult<import('@/types/orderCenter').OrderCenterBalance>>('/order-center/balance', { params: { tab } })
      .then(unwrap),
}

export const enterpriseApi = {
  getAccountOverview: () =>
    api
      .get<ApiResult<import('@/types/enterprise').EnterpriseAccountOverview>>('/enterprise/account-overview')
      .then(unwrap),
}

export const teamApi = {
  getCurrent: () =>
    api.get<ApiResult<import('@/types/team').TeamOverview>>('/teams/current').then(unwrap),
  get: (teamId: number) =>
    api.get<ApiResult<import('@/types/team').TeamOverview>>(`/teams/${teamId}`).then(unwrap),
  getMembers: (teamId: number) =>
    api.get<ApiResult<import('@/types/team').TeamMember[]>>(`/teams/${teamId}/members`).then(unwrap),
  invite: (teamId: number, data: { email?: string; userId?: number; role?: string }) =>
    api
      .post<ApiResult<import('@/types/team').TeamInvitation>>(`/teams/${teamId}/invitations`, data)
      .then(unwrap),
  getInvitations: (teamId: number) =>
    api
      .get<ApiResult<import('@/types/team').TeamInvitation[]>>(`/teams/${teamId}/invitations`)
      .then(unwrap),
  updateRole: (teamId: number, targetUserId: number, role: 'admin' | 'member') =>
    api
      .put<ApiResult<import('@/types/team').TeamMember>>(`/teams/${teamId}/members/${targetUserId}/role`, { role })
      .then(unwrap),
  removeMember: (teamId: number, targetUserId: number) =>
    api.delete<ApiResult<void>>(`/teams/${teamId}/members/${targetUserId}`).then(unwrap),
  getPresence: (teamId: number) =>
    api
      .get<ApiResult<import('@/types/team').TeamPresence[]>>(`/teams/${teamId}/presence`)
      .then(unwrap),
  updatePresence: (teamId: number, status: 'online' | 'away' | 'offline') =>
    api
      .put<ApiResult<import('@/types/team').TeamPresence>>(`/teams/${teamId}/presence`, { status })
      .then(unwrap),
  getComments: (teamId: number, designId: number) =>
    api
      .get<ApiResult<import('@/types/team').TeamComment[]>>(`/teams/${teamId}/designs/${designId}/comments`)
      .then(unwrap),
  addComment: (teamId: number, designId: number, data: { content: string; parentId?: number }) =>
    api
      .post<ApiResult<import('@/types/team').TeamComment>>(`/teams/${teamId}/designs/${designId}/comments`, data)
      .then(unwrap),
  removeComment: (teamId: number, commentId: number) =>
    api.delete<ApiResult<void>>(`/teams/${teamId}/comments/${commentId}`).then(unwrap),
  getVersions: (teamId: number, designId: number) =>
    api
      .get<ApiResult<import('@/types/team').TeamVersion[]>>(`/teams/${teamId}/designs/${designId}/versions`)
      .then(unwrap),
  createVersion: (teamId: number, designId: number, data: { canvasJson: string; note?: string }) =>
    api
      .post<ApiResult<import('@/types/team').TeamVersion>>(`/teams/${teamId}/designs/${designId}/versions`, data)
      .then(unwrap),
}

export const supportTicketApi = {
  list: () =>
    api.get<ApiResult<import('@/types/supportTicket').SupportTicket[]>>('/support/tickets').then(unwrap),
  create: (data: {
    subject: string
    content: string
    priority: import('@/types/supportTicket').SupportTicketPriority
  }) => api.post<ApiResult<import('@/types/supportTicket').SupportTicket>>('/support/tickets', data).then(unwrap),
  update: (id: number, data: { status: import('@/types/supportTicket').SupportTicketStatus; reply?: string }) =>
    api.put<ApiResult<import('@/types/supportTicket').SupportTicket>>(`/support/tickets/${id}`, data).then(unwrap),
}

export const adminRbacApi = {
  get: () => api.get<ApiResult<import('@/pages/RbacPage').RbacCatalog>>('/admin/rbac').then(unwrap),
  updateUser: (id: number, data: { systemRole: string; status?: number }) => api.put<ApiResult<import('@/types').UserInfo>>(`/admin/rbac/users/${id}`, data).then(unwrap),
}

export const teamIntroApi = {
  getIndex: () =>
    api.get<ApiResult<import('@/types/teamIntro').TeamIntroPageData>>('/team-intro/index').then(unwrap),
}

export const helpFabApi = {
  getIndex: () =>
    api.get<ApiResult<import('@/types/helpFab').HelpFabIndexData>>('/help-fab/index').then(unwrap),
}

export const feedbackApi = {
  getIndex: () =>
    api.get<ApiResult<import('@/types/feedback').FeedbackIndexData>>('/feedback/index').then(unwrap),
  submit: (data: { feedbackTypeCode: string; feedbackContent: string }) =>
    api
      .post<ApiResult<import('@/types/feedback').FeedbackSubmitResult>>('/feedback/submit', data)
      .then(unwrap),
  getSuccess: (id: number) =>
    api
      .get<ApiResult<import('@/types/feedback').FeedbackSuccessData>>(`/feedback/success/${id}`)
      .then(unwrap),
}

export const teamUpgradeApi = {
  getModal: () =>
    api.get<ApiResult<import('@/types/teamUpgrade').TeamUpgradeModalData>>('/team-upgrade/modal').then(unwrap),
  submit: (data: { sizeCode: string }) =>
    api
      .post<ApiResult<import('@/types/teamUpgrade').TeamUpgradeSubmitResult>>('/team-upgrade/submit', data)
      .then(unwrap),
}

export const aiTopicApi = {
  getIndex: (code: string) =>
    api
      .get<ApiResult<import('@/types/aiTopic').AiTopicIndexData>>(`/ai-topic/${code}/index`)
      .then(unwrap),
  generate: (
    code: string,
    data: { prompt?: string; presetId?: number; inspirationId?: number },
  ) =>
    api
      .post<ApiResult<import('@/types').AiGenerateResult>>(`/ai-topic/${code}/generate`, data)
      .then(unwrap),
}

export const aiApi = {
  getTask: (id: number) => api.get<ApiResult<{ id: number; status: number; outputUrl?: string; errorMsg?: string }>>(`/ai-tasks/${id}`).then(unwrap),
  getConfig: (mode: string) =>
    api.get<ApiResult<import('@/types').AiModeConfig>>(`/ai/config?mode=${mode}`).then(unwrap),
  generate: (data: {
    mode: string
    prompt: string
    model?: string
    aspectRatio?: string
    style?: string
    referenceUrls?: string[]
    agentMode?: boolean
    autoMode?: boolean
    toolCode?: string
  }) => api.post<ApiResult<import('@/types').AiGenerateResult>>('/ai/generate', data).then(unwrap),
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post<ApiResult<{ url: string; filename: string }>>('/ai/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrap)
  },
  enhancePrompt: (data: { prompt: string; mode?: string }) =>
    api.post<ApiResult<{ prompt: string }>>('/ai/enhance-prompt', data).then(unwrap),
}

export interface MattingTask {
  id: number
  status: number
  sourceUrl?: string
  outputUrl?: string
  errorMsg?: string
  mock?: boolean
}

export const mattingApi = {
  createTask: (sourceUrl: string) =>
    api.post<ApiResult<MattingTask>>('/matting/tasks', { sourceUrl }).then(unwrap),
  getTask: (id: number) =>
    api.get<ApiResult<MattingTask>>(`/matting/tasks/${id}`).then(unwrap),
}

export default api
