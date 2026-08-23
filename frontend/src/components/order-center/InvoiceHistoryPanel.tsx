import type { OrderCenterInvoice } from '@/types/orderCenter'
import { OrderEmptyState } from './OrderEmptyState'

interface Props {
  invoices: OrderCenterInvoice[]
  emptyText: string
  loading?: boolean
}

export function InvoiceHistoryPanel({ invoices, emptyText, loading }: Props) {
  return (
    <section className="order-panel">
      <h1 className="order-panel__title">开票历史</h1>
      {loading ? (
        <div className="order-panel__loading">加载中...</div>
      ) : invoices.length === 0 ? (
        <OrderEmptyState text={emptyText} />
      ) : (
        <ul className="order-list">
          {invoices.map((invoice) => (
            <li key={invoice.id} className="order-list__item">
              <div className="order-list__main">
                <p className="order-list__name">{invoice.title}</p>
                <p className="order-list__meta">
                  {invoice.invoiceNo} · {invoice.invoiceTypeLabel}
                  {invoice.taxNo ? ` · ${invoice.taxNo}` : ''}
                </p>
                <p className="order-list__time">{invoice.issueTime || invoice.createTime}</p>
              </div>
              <div className="order-list__amount">{invoice.amountLabel}</div>
              <div className="order-list__status is-paid">{invoice.statusLabel}</div>
              <div className="order-list__actions">
                <span className="order-list__email">{invoice.email}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
