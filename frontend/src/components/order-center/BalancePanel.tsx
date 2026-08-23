import type { OrderCenterBalance, OrderCenterTab } from '@/types/orderCenter'
import { cn } from '@/utils'
import { OrderEmptyState } from './OrderEmptyState'

interface Props {
  tabs: OrderCenterTab[]
  tab: string
  onTabChange: (code: string) => void
  data?: OrderCenterBalance
  emptyText: string
  loading?: boolean
}

export function BalancePanel({ tabs, tab, onTabChange, data, emptyText, loading }: Props) {
  return (
    <section className="order-panel">
      <h1 className="order-panel__title">余额收支</h1>
      <div className="balance-hero">
        <span>当前余额</span>
        <strong>{data?.balanceLabel ?? '¥0'}</strong>
      </div>
      <div className="order-tabs">
        {tabs.map((item) => (
          <button
            key={item.code}
            type="button"
            className={cn('order-tabs__item', tab === item.code && 'is-active')}
            onClick={() => onTabChange(item.code)}
          >
            {item.name}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="order-panel__loading">加载中...</div>
      ) : !data || data.logs.length === 0 ? (
        <OrderEmptyState text={emptyText} />
      ) : (
        <ul className="order-list">
          {data.logs.map((log) => (
            <li key={log.id} className="order-list__item">
              <div className="order-list__main">
                <p className="order-list__name">{log.title}</p>
                {log.remark ? <p className="order-list__meta">{log.remark}</p> : null}
                <p className="order-list__time">{log.createTime}</p>
              </div>
              <div className={cn('order-list__amount', log.income ? 'is-income' : 'is-expense')}>
                {log.changeLabel}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
