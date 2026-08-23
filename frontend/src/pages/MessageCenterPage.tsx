import { useEffect, useState } from 'react'
import { LoginModal } from '@/components/auth/LoginModal'
import {
  MessageCenterDetail,
  MessageCenterList,
  MessageCenterTabs,
} from '@/components/message-center/MessageCenterParts'
import { OrderCenterHeader } from '@/components/order-center/OrderCenterHeader'
import { useAuth } from '@/context/AuthContext'
import {
  useMarkAllMessagesRead,
  useMarkMessageRead,
  useMessageCenterDetail,
  useMessageCenterIndex,
  useMessageCenterList,
} from '@/hooks/useMessageCenter'

export function MessageCenterPage() {
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const [category, setCategory] = useState('all')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: indexData, isLoading: indexLoading, isError: indexError } = useMessageCenterIndex(isLoggedIn)
  const listQuery = useMessageCenterList(category, isLoggedIn && !!indexData)
  const detailQuery = useMessageCenterDetail(selectedId, isLoggedIn && selectedId != null)
  const markRead = useMarkMessageRead()
  const markAllRead = useMarkAllMessagesRead()

  useEffect(() => {
    if (!isLoggedIn) setShowLoginModal(true)
  }, [isLoggedIn, setShowLoginModal])

  useEffect(() => {
    setSelectedId(null)
  }, [category])

  useEffect(() => {
    const items = listQuery.data?.list ?? []
    if (items.length > 0 && selectedId == null) {
      const first = items[0]
      setSelectedId(first.id)
      if (!first.read) {
        void markRead.mutateAsync(first.id)
      }
    }
  }, [listQuery.data, selectedId, markRead])

  const handleSelect = (id: number) => {
    setSelectedId(id)
    const item = listQuery.data?.list.find((m) => m.id === id)
    if (item && !item.read) {
      void markRead.mutateAsync(id)
    }
  }

  const items = listQuery.data?.list ?? []
  const unreadCount = listQuery.data?.unreadCount ?? indexData?.unreadCount ?? 0
  const pageTitle = indexData?.pageTitle ?? '消息中心'
  const emptyText = indexData?.emptyText ?? '暂时没有消息'

  return (
    <div className="message-center-page">
      <OrderCenterHeader />
      <div className="message-center-page__content">
        {!isLoggedIn ? (
          <div className="message-center-login">
            <h2>登录后查看消息</h2>
            <p>系统通知、活动消息、订单消息将在此展示</p>
            <button type="button" className="order-btn order-btn--primary" onClick={() => setShowLoginModal(true)}>
              立即登录
            </button>
          </div>
        ) : indexError ? (
          <div className="message-center-login">加载失败，请刷新重试</div>
        ) : indexLoading || !indexData ? (
          <div className="message-center-login">加载中...</div>
        ) : (
          <>
            <div className="message-center-page__head">
              <h1 className="message-center-page__title">{pageTitle}</h1>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  className="message-center-page__read-all"
                  disabled={markAllRead.isPending}
                  onClick={() => {
                    void markAllRead.mutateAsync(category)
                  }}
                >
                  全部已读
                </button>
              ) : null}
            </div>
            <section className="message-center-panel">
              <MessageCenterTabs
                categories={indexData.categories}
                activeCategory={category}
                onChange={setCategory}
              />
              <div className="message-center-panel__body">
                <aside className="message-center-panel__list">
                  {listQuery.isLoading ? (
                    <div className="message-center-list__empty">加载中...</div>
                  ) : (
                    <MessageCenterList
                      items={items}
                      selectedId={selectedId}
                      emptyText={emptyText}
                      onSelect={handleSelect}
                    />
                  )}
                </aside>
                <main className="message-center-panel__detail">
                  <MessageCenterDetail message={detailQuery.data} loading={detailQuery.isLoading && selectedId != null} />
                </main>
              </div>
            </section>
          </>
        )}
      </div>
      <LoginModal />
    </div>
  )
}
