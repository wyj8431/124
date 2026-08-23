import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { LoginModal } from '@/components/auth/LoginModal'
import { OrderCenterHeader } from '@/components/order-center/OrderCenterHeader'
import { OrderListPanel } from '@/components/order-center/OrderListPanel'
import { InvoiceApplyPanel } from '@/components/order-center/InvoiceApplyPanel'
import { InvoiceHistoryPanel } from '@/components/order-center/InvoiceHistoryPanel'
import { TransferPanel } from '@/components/order-center/TransferPanel'
import { BalancePanel } from '@/components/order-center/BalancePanel'
import { useAuth } from '@/context/AuthContext'
import {
  useBalance,
  useEligibleInvoices,
  useInvoiceHistory,
  useOrderCenterActions,
  useOrderCenterIndex,
  useOrderCenterOrders,
  useTransfers,
} from '@/hooks/useOrderCenter'
import type { OrderCenterSection } from '@/types/orderCenter'
import { cn } from '@/utils'

const SECTION_TITLES: Record<string, string> = {
  vip: 'VIP订单',
  seat: '席位订单',
  print: '印刷订单',
}

const VALID_SECTIONS: OrderCenterSection[] = [
  'vip',
  'seat',
  'print',
  'transfer',
  'balance',
  'invoice',
  'invoice-history',
]

export function OrderCenterPage() {
  const { section = 'vip' } = useParams()
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const [orderStatus, setOrderStatus] = useState('all')
  const [balanceTab, setBalanceTab] = useState('all')

  const current = (VALID_SECTIONS.includes(section as OrderCenterSection)
    ? section
    : 'vip') as OrderCenterSection

  const { data: indexData, isLoading: indexLoading, isError: indexError } = useOrderCenterIndex(isLoggedIn)
  const isOrderSection = current === 'vip' || current === 'seat' || current === 'print'
  const ordersQuery = useOrderCenterOrders(current, orderStatus, isLoggedIn && isOrderSection)
  const eligibleQuery = useEligibleInvoices(isLoggedIn && current === 'invoice')
  const historyQuery = useInvoiceHistory(isLoggedIn && current === 'invoice-history')
  const transferQuery = useTransfers(isLoggedIn && current === 'transfer')
  const balanceQuery = useBalance(balanceTab, isLoggedIn && current === 'balance')
  const { pay, cancel, applyInvoice, submitTransfer } = useOrderCenterActions()

  useEffect(() => {
    if (!isLoggedIn) setShowLoginModal(true)
  }, [isLoggedIn, setShowLoginModal])

  useEffect(() => {
    setOrderStatus('all')
  }, [current])

  if (!VALID_SECTIONS.includes(section as OrderCenterSection)) {
    return <Navigate to="/usercenter/vip" replace />
  }

  return (
    <div className="order-center-page">
      <OrderCenterHeader />
      <div className="order-center-page__body">
        {!isLoggedIn ? (
          <div className="order-center-card order-center-card--login">
            <h2>登录后查看订单/发票</h2>
            <p>支付会员、席位和印刷订单后，可在此管理订单并申请发票</p>
            <button type="button" className="order-btn order-btn--primary" onClick={() => setShowLoginModal(true)}>
              立即登录
            </button>
          </div>
        ) : indexError ? (
          <div className="order-center-card order-center-card--login">加载失败，请刷新重试</div>
        ) : indexLoading || !indexData ? (
          <div className="order-center-card order-center-card--login">加载中...</div>
        ) : (
          <div className="order-center-card">
            <aside className="order-center-sidebar">
              {indexData.navItems.map((item) => (
                <Link
                  key={item.code}
                  to={item.routePath}
                  className={cn(
                    'order-center-sidebar__item',
                    current === item.code && 'is-active',
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </aside>
            <div className="order-center-main">
              {isOrderSection ? (
                <OrderListPanel
                  title={SECTION_TITLES[current]}
                  tabs={indexData.orderTabs}
                  status={orderStatus}
                  onStatusChange={setOrderStatus}
                  orders={ordersQuery.data?.list ?? []}
                  emptyText={indexData.emptyText}
                  loading={ordersQuery.isLoading}
                  paying={pay.isPending}
                  onPay={(id) => pay.mutateAsync(id)}
                  onCancel={(id) => cancel.mutateAsync(id)}
                />
              ) : null}
              {current === 'invoice' ? (
                <InvoiceApplyPanel
                  indexData={indexData}
                  orders={eligibleQuery.data ?? []}
                  loading={eligibleQuery.isLoading}
                  submitting={applyInvoice.isPending}
                  onSubmit={(data) => applyInvoice.mutateAsync(data)}
                />
              ) : null}
              {current === 'invoice-history' ? (
                <InvoiceHistoryPanel
                  invoices={historyQuery.data?.list ?? []}
                  emptyText={indexData.emptyHistoryText}
                  loading={historyQuery.isLoading}
                />
              ) : null}
              {current === 'transfer' ? (
                <TransferPanel
                  bank={indexData.bankAccount}
                  transfers={transferQuery.data?.list ?? []}
                  loading={transferQuery.isLoading}
                  submitting={submitTransfer.isPending}
                  onSubmit={(data) => submitTransfer.mutateAsync(data)}
                />
              ) : null}
              {current === 'balance' ? (
                <BalancePanel
                  tabs={indexData.balanceTabs}
                  tab={balanceTab}
                  onTabChange={setBalanceTab}
                  data={balanceQuery.data}
                  emptyText={indexData.emptyBalanceText}
                  loading={balanceQuery.isLoading}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
      <LoginModal />
    </div>
  )
}
