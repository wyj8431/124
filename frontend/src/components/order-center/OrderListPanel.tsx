import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { OrderCenterOrder, OrderCenterTab } from '@/types/orderCenter'
import { cn } from '@/utils'
import { OrderEmptyState } from './OrderEmptyState'
import { OrderPayDialog } from './OrderPayDialog'

interface Props {
  title: string
  tabs: OrderCenterTab[]
  status: string
  onStatusChange: (code: string) => void
  orders: OrderCenterOrder[]
  emptyText: string
  loading?: boolean
  onPay: (id: number) => Promise<unknown>
  onCancel: (id: number) => Promise<unknown>
  paying?: boolean
}

export function OrderListPanel({
  title,
  tabs,
  status,
  onStatusChange,
  orders,
  emptyText,
  loading,
  onPay,
  onCancel,
  paying,
}: Props) {
  const [payOrder, setPayOrder] = useState<OrderCenterOrder | null>(null)

  return (
    <section className="order-panel">
      <h1 className="order-panel__title">{title}</h1>
      <div className="order-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.code}
            type="button"
            className={cn('order-tabs__item', status === tab.code && 'is-active')}
            onClick={() => onStatusChange(tab.code)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="order-panel__loading">加载中...</div>
      ) : orders.length === 0 ? (
        <OrderEmptyState text={emptyText} />
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.id} className="order-list__item">
              <div className="order-list__main">
                <p className="order-list__name">{order.productName}</p>
                <p className="order-list__meta">
                  订单号 {order.orderNo}
                  {order.productDesc ? ` · ${order.productDesc}` : ''}
                </p>
                <p className="order-list__time">{order.createTime}</p>
              </div>
              <div className="order-list__amount">{order.amountLabel}</div>
              <div
                className={cn(
                  'order-list__status',
                  order.status === 'pending' && 'is-pending',
                  order.status === 'paid' && 'is-paid',
                  order.status === 'cancelled' && 'is-cancelled',
                )}
              >
                {order.statusLabel}
              </div>
              <div className="order-list__actions">
                {order.canPay ? (
                  <button type="button" className="order-btn order-btn--primary" onClick={() => setPayOrder(order)}>
                    去支付
                  </button>
                ) : null}
                {order.canCancel ? (
                  <button
                    type="button"
                    className="order-btn"
                    onClick={() => {
                      void onCancel(order.id)
                    }}
                  >
                    取消订单
                  </button>
                ) : null}
                {order.canInvoice ? (
                  <Link to="/usercenter/invoice" className="order-btn">
                    申请发票
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {payOrder ? (
        <OrderPayDialog
          order={payOrder}
          paying={paying}
          onClose={() => setPayOrder(null)}
          onPay={async () => {
            await onPay(payOrder.id)
            setPayOrder(null)
          }}
        />
      ) : null}
    </section>
  )
}
