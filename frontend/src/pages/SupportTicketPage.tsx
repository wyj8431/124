import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { LifeBuoy, MessageSquarePlus, RefreshCw } from 'lucide-react'
import { supportTicketApi } from '@/api'
import { useAuth } from '@/context/AuthContext'
import type { SupportTicket, SupportTicketPriority, SupportTicketStatus } from '@/types/supportTicket'

const statusLabels: Record<string, string> = { open: '待处理', pending: '处理中', resolved: '已解决', closed: '已关闭' }
const priorityLabels: Record<string, string> = { low: '低', normal: '普通', high: '高', urgent: '紧急' }

function formatDate(value?: string | null) {
  if (!value) return '刚刚'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false })
}

export function SupportTicketPage() {
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<SupportTicketPriority>('normal')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [busyTicketId, setBusyTicketId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const loadTickets = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      setTickets(await supportTicketApi.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : '工单加载失败')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      setIsLoading(false)
      return
    }
    void loadTickets()
  }, [isLoggedIn, loadTickets, setShowLoginModal])

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!subject.trim() || !content.trim()) return
    setIsSubmitting(true)
    setError('')
    try {
      const created = await supportTicketApi.create({ subject: subject.trim(), content: content.trim(), priority })
      setTickets((current) => [created, ...current])
      setSubject('')
      setContent('')
      setPriority('normal')
    } catch (err) {
      setError(err instanceof Error ? err.message : '工单提交失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStatus(ticket: SupportTicket, status: SupportTicketStatus) {
    setBusyTicketId(ticket.id)
    setError('')
    try {
      const updated = await supportTicketApi.update(ticket.id, { status })
      setTickets((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch (err) {
      setError(err instanceof Error ? err.message : '工单状态更新失败')
    } finally {
      setBusyTicketId(null)
    }
  }

  if (!isLoggedIn) return <div className="support-page__loading">请先登录后提交工单</div>

  return (
    <div className="support-page">
      <div className="support-page__inner">
        <header className="support-page__header">
          <div><span className="support-page__eyebrow"><LifeBuoy size={16} aria-hidden="true" /> 客服中心</span><h1>我的工单</h1><p>提交问题后，客服会在工单中回复你。</p></div>
          <button type="button" className="support-page__refresh" onClick={() => void loadTickets()} disabled={isLoading}><RefreshCw size={16} aria-hidden="true" /> 刷新</button>
        </header>

        {error && <div className="support-page__alert" role="alert">{error}</div>}
        <div className="support-page__grid">
          <section className="support-panel support-panel--form">
            <div className="support-panel__title"><MessageSquarePlus size={18} aria-hidden="true" /><div><h2>新建工单</h2><p>描述越具体，处理越快</p></div></div>
            <form onSubmit={handleCreate} className="support-form">
              <label>问题标题<input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="例如：导出图片失败" maxLength={120} required /></label>
              <label>问题描述<textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="请描述发生了什么、何时发生，以及可以复现的步骤" rows={6} required /></label>
              <label>优先级<select value={priority} onChange={(event) => setPriority(event.target.value as SupportTicketPriority)}><option value="low">低</option><option value="normal">普通</option><option value="high">高</option><option value="urgent">紧急</option></select></label>
              <button type="submit" className="support-form__submit" disabled={isSubmitting}>{isSubmitting ? '提交中...' : '提交工单'}</button>
            </form>
          </section>

          <section className="support-panel support-panel--list">
            <div className="support-panel__list-head"><div><h2>工单记录</h2><p>{tickets.length ? `共 ${tickets.length} 条记录` : '还没有提交过工单'}</p></div></div>
            {isLoading ? <div className="support-page__empty">加载中...</div> : tickets.length === 0 ? <div className="support-page__empty">提交第一个工单后，记录会显示在这里。</div> : <div className="support-ticket-list">{tickets.map((ticket) => <article className="support-ticket" key={ticket.id}><div className="support-ticket__head"><div><h3>{ticket.subject}</h3><p>#{ticket.id} · {formatDate(ticket.updateTime || ticket.createTime)}</p></div><span className={`support-ticket__status support-ticket__status--${ticket.status}`}>{statusLabels[ticket.status] || ticket.status}</span></div><p className="support-ticket__content">{ticket.content}</p>{ticket.lastReply && <div className="support-ticket__reply"><strong>客服回复</strong><p>{ticket.lastReply}</p></div>}<div className="support-ticket__foot"><span className="support-ticket__priority">优先级：{priorityLabels[ticket.priority] || ticket.priority}</span>{ticket.status === 'closed' ? <button type="button" onClick={() => void handleStatus(ticket, 'open')} disabled={busyTicketId === ticket.id}>重新打开</button> : <button type="button" onClick={() => void handleStatus(ticket, 'closed')} disabled={busyTicketId === ticket.id}>关闭工单</button>}</div></article>)}</div>}
          </section>
        </div>
      </div>
    </div>
  )
}
