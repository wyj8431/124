export type SupportTicketStatus = 'open' | 'pending' | 'resolved' | 'closed'
export type SupportTicketPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface SupportTicket {
  id: number
  subject: string
  content: string
  priority: SupportTicketPriority | string
  status: SupportTicketStatus | string
  assigneeId?: number | null
  lastReply?: string | null
  createTime?: string | null
  updateTime?: string | null
}
