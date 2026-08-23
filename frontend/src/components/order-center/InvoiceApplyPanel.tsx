import { useMemo, useState } from 'react'
import type { OrderCenterIndexData, OrderCenterOrder } from '@/types/orderCenter'
import { OrderEmptyState } from './OrderEmptyState'

interface Props {
  indexData: OrderCenterIndexData
  orders: OrderCenterOrder[]
  loading?: boolean
  submitting?: boolean
  onSubmit: (data: {
    invoiceType: string
    title: string
    taxNo?: string
    email: string
    remark?: string
    orderIds: number[]
  }) => Promise<unknown>
}

export function InvoiceApplyPanel({ indexData, orders, loading, submitting, onSubmit }: Props) {
  const [invoiceType, setInvoiceType] = useState(indexData.invoiceTypes[0]?.code ?? 'enterprise')
  const [title, setTitle] = useState('')
  const [taxNo, setTaxNo] = useState('')
  const [email, setEmail] = useState('')
  const [remark, setRemark] = useState('')
  const [selected, setSelected] = useState<number[]>([])
  const [message, setMessage] = useState('')

  const selectedOrders = useMemo(
    () => orders.filter((order) => selected.includes(order.id)),
    [orders, selected],
  )
  const totalLabel = selectedOrders.length
    ? `¥${selectedOrders.reduce((sum, order) => sum + order.amount, 0)}`
    : '¥0'

  const toggle = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleSubmit = async () => {
    setMessage('')
    try {
      await onSubmit({
        invoiceType,
        title,
        taxNo: invoiceType === 'enterprise' ? taxNo : undefined,
        email,
        remark,
        orderIds: selected,
      })
      setTitle('')
      setTaxNo('')
      setEmail('')
      setRemark('')
      setSelected([])
      setMessage('发票已开具，可在开票历史中查看')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '开票失败')
    }
  }

  return (
    <section className="order-panel">
      <h1 className="order-panel__title">申请发票</h1>
      <p className="order-panel__desc">仅支持为已支付且未开票的订单申请增值税电子普通发票</p>

      <div className="invoice-form">
        <label className="invoice-field">
          <span>抬头类型</span>
          <div className="invoice-radios">
            {indexData.invoiceTypes.map((item) => (
              <button
                key={item.code}
                type="button"
                className={invoiceType === item.code ? 'is-active' : ''}
                onClick={() => setInvoiceType(item.code)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </label>
        <label className="invoice-field">
          <span>发票抬头</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="请输入发票抬头" />
        </label>
        {invoiceType === 'enterprise' ? (
          <label className="invoice-field">
            <span>纳税人识别号</span>
            <input value={taxNo} onChange={(e) => setTaxNo(e.target.value)} placeholder="请输入纳税人识别号" />
          </label>
        ) : null}
        <label className="invoice-field">
          <span>电子邮箱</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="发票将发送到该邮箱" />
        </label>
        <label className="invoice-field">
          <span>备注</span>
          <input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="选填" />
        </label>
      </div>

      <h2 className="order-panel__subtitle">选择订单</h2>
      {loading ? (
        <div className="order-panel__loading">加载中...</div>
      ) : orders.length === 0 ? (
        <OrderEmptyState text={indexData.emptyInvoiceText} />
      ) : (
        <ul className="invoice-orders">
          {orders.map((order) => (
            <li key={order.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selected.includes(order.id)}
                  onChange={() => toggle(order.id)}
                />
                <span className="invoice-orders__name">{order.productName}</span>
                <span className="invoice-orders__no">{order.orderNo}</span>
                <span className="invoice-orders__amount">{order.amountLabel}</span>
              </label>
            </li>
          ))}
        </ul>
      )}

      <div className="invoice-submit">
        <span>已选 {selected.length} 笔，合计 {totalLabel}</span>
        <button
          type="button"
          className="order-btn order-btn--primary"
          disabled={submitting || selected.length === 0}
          onClick={() => {
            void handleSubmit()
          }}
        >
          {submitting ? '提交中...' : '申请开票'}
        </button>
      </div>
      {message ? <p className="order-panel__message">{message}</p> : null}
    </section>
  )
}
