import { Link } from 'react-router-dom'
import type { MessageCenterCategory, MessageCenterMessage } from '@/types/messageCenter'
import { cn } from '@/utils'

export function MessageCenterTabs({
  categories,
  activeCategory,
  onChange,
}: {
  categories: MessageCenterCategory[]
  activeCategory: string
  onChange: (code: string) => void
}) {
  return (
    <div className="message-center-tabs">
      {categories.map((cat) => (
        <button
          key={cat.code}
          type="button"
          className={cn('message-center-tabs__item', activeCategory === cat.code && 'is-active')}
          onClick={() => onChange(cat.code)}
        >
          {cat.name}
          {cat.unreadCount > 0 ? <span className="message-center-tabs__badge">{cat.unreadCount}</span> : null}
        </button>
      ))}
    </div>
  )
}

export function MessageCenterList({
  items,
  selectedId,
  emptyText,
  onSelect,
}: {
  items: MessageCenterMessage[]
  selectedId: number | null
  emptyText: string
  onSelect: (id: number) => void
}) {
  if (items.length === 0) {
    return <div className="message-center-list__empty">{emptyText}</div>
  }

  return (
    <ul className="message-center-list">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            className={cn(
              'message-center-list__item',
              !item.read && 'is-unread',
              selectedId === item.id && 'is-selected',
            )}
            onClick={() => onSelect(item.id)}
          >
            <div className="message-center-list__item-head">
              <span className="message-center-list__category">{item.categoryLabel}</span>
              <time className="message-center-list__time">{item.createTime}</time>
            </div>
            <h3 className="message-center-list__title">{item.title}</h3>
            {item.summary ? <p className="message-center-list__summary">{item.summary}</p> : null}
          </button>
        </li>
      ))}
    </ul>
  )
}

export function MessageCenterDetail({
  message,
  loading,
}: {
  message: MessageCenterMessage | undefined
  loading: boolean
}) {
  if (loading) {
    return <div className="message-center-detail__placeholder">加载中...</div>
  }

  if (!message) {
    return <div className="message-center-detail__placeholder">选择一条消息查看详情</div>
  }

  return (
    <article className="message-center-detail">
      <header className="message-center-detail__header">
        <span className="message-center-detail__category">{message.categoryLabel}</span>
        <time className="message-center-detail__time">{message.createTime}</time>
        <h2 className="message-center-detail__title">{message.title}</h2>
      </header>
      {message.content ? (
        <div className="message-center-detail__content" dangerouslySetInnerHTML={{ __html: message.content }} />
      ) : message.summary ? (
        <p className="message-center-detail__summary">{message.summary}</p>
      ) : null}
      {message.linkUrl && message.linkText ? (
        <Link to={message.linkUrl} className="message-center-detail__link">
          {message.linkText}
        </Link>
      ) : null}
    </article>
  )
}
