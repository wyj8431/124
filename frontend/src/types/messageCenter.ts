export interface MessageCenterCategory {
  code: string
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
  category: string
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
