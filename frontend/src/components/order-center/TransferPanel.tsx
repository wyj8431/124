import { useState } from 'react'
import type { OrderCenterBankAccount, OrderCenterTransfer } from '@/types/orderCenter'
import { OrderEmptyState } from './OrderEmptyState'

interface Props {
  bank: OrderCenterBankAccount
  transfers: OrderCenterTransfer[]
  loading?: boolean
  submitting?: boolean
  onSubmit: (data: { amountCents: number; payerName: string; remark?: string }) => Promise<unknown>
}

export function TransferPanel({ bank, transfers, loading, submitting, onSubmit }: Props) {
  const [amount, setAmount] = useState('')
  const [payerName, setPayerName] = useState('')
  const [remark, setRemark] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setMessage('')
    const yuan = Number(amount)
    if (!Number.isFinite(yuan) || yuan <= 0) {
      setMessage('请输入正确的转账金额')
      return
    }
    try {
      await onSubmit({
        amountCents: Math.round(yuan * 100),
        payerName,
        remark,
      })
      setAmount('')
      setPayerName('')
      setRemark('')
      setMessage('已提交，等待财务确认')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '提交失败')
    }
  }

  return (
    <section className="order-panel">
      <h1 className="order-panel__title">对公转账</h1>
      <div className="transfer-bank">
        <h2>收款账户</h2>
        <p><span>公司名称</span>{bank.companyName}</p>
        <p><span>开户银行</span>{bank.bankName}</p>
        <p><span>银行账号</span>{bank.accountNo}</p>
        <p><span>税号</span>{bank.taxNo}</p>
        <p><span>转账备注</span>{bank.remark}</p>
        <p className="transfer-bank__tip">{bank.tip}</p>
      </div>

      <div className="invoice-form">
        <label className="invoice-field">
          <span>转账金额</span>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="请输入转账金额（元）" />
        </label>
        <label className="invoice-field">
          <span>付款户名</span>
          <input value={payerName} onChange={(e) => setPayerName(e.target.value)} placeholder="请输入付款账户名称" />
        </label>
        <label className="invoice-field">
          <span>备注</span>
          <input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="选填，建议填写用户ID" />
        </label>
      </div>
      <div className="invoice-submit">
        <span />
        <button
          type="button"
          className="order-btn order-btn--primary"
          disabled={submitting}
          onClick={() => {
            void handleSubmit()
          }}
        >
          {submitting ? '提交中...' : '提交转账信息'}
        </button>
      </div>
      {message ? <p className="order-panel__message">{message}</p> : null}

      <h2 className="order-panel__subtitle">转账记录</h2>
      {loading ? (
        <div className="order-panel__loading">加载中...</div>
      ) : transfers.length === 0 ? (
        <OrderEmptyState text="暂时没有任何转账记录" />
      ) : (
        <ul className="order-list">
          {transfers.map((item) => (
            <li key={item.id} className="order-list__item">
              <div className="order-list__main">
                <p className="order-list__name">{item.payerName}</p>
                <p className="order-list__meta">{item.transferNo}{item.remark ? ` · ${item.remark}` : ''}</p>
                <p className="order-list__time">{item.createTime}</p>
              </div>
              <div className="order-list__amount">{item.amountLabel}</div>
              <div className="order-list__status is-pending">{item.statusLabel}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
