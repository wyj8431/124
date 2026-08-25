export type MessageCenterCategoryCode = 'all' | 'system' | 'activity' | 'order' | 'collaboration'

export interface MessageCenterCategory {
  code: MessageCenterCategoryCode
  name: string
  unreadCount: number
}

export interface MessageCenterIndexData {
  pageTitle: string
  emptyText: string
  unreadCount: number
  categories: MessageCenterCategory[]
}

export interface MessageCenterMessage {
  id: number
  category: Exclude<MessageCenterCategoryCode, 'all'> | string
  categoryLabel: string
  title: string
  summary?: string
  content?: string
  linkUrl?: string | null
  linkText?: string | null
  read: boolean
  createTime: string
}

export interface MessageCenterListResult {
  list: MessageCenterMessage[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  unreadCount: number
}
