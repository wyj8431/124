import { useState } from 'react'
import { ChevronLeft, ChevronRight, Info, Ticket } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CouponCenterCoupon, CouponCenterStatusTab } from '@/types/couponCenter'
import { cn } from '@/utils'

export function CouponCenterBreadcrumb({
  parent,
  current,
}: {
  parent: string
  current: string
}) {
  return (
    <nav className="coupon-center-breadcrumb" aria-label="面包屑">
      <span>{parent}</span>
      <ChevronRight className="h-3.5 w-3.5" />
      <span className="is-current">{current}</span>
    </nav>
  )
}

export function CouponCenterPanel({
  pageTitle,
  backText,
  tabs,
  activeStatus,
  instructionsTitle,
  instructionsContent,
  items,
  loading,
  emptyText,
  onStatusChange,
}: {
  pageTitle: string
  backText: string
  tabs: CouponCenterStatusTab[]
  activeStatus: string
  instructionsTitle: string
  instructionsContent: string
  items: CouponCenterCoupon[]
  loading: boolean
  emptyText: string
  onStatusChange: (status: string) => void
}) {
  const [showInstructions, setShowInstructions] = useState(false)

  return (
    <section className="coupon-center-panel">
      <aside className="coupon-center-panel__brand">
        <div className="coupon-center-panel__brand-icon">
          <Ticket className="h-10 w-10" strokeWidth={1.5} />
        </div>
        <h2>{pageTitle}</h2>
      </aside>

      <div className="coupon-center-panel__main">
        <div className="coupon-center-panel__toolbar">
          <Link to="/" className="coupon-center-panel__back">
            <ChevronLeft className="h-4 w-4" />
            {backText}
          </Link>
          <button
            type="button"
            className="coupon-center-panel__instructions"
            onClick={() => setShowInstructions((v) => !v)}
          >
            <Info className="h-4 w-4" />
            {instructionsTitle}
          </button>
        </div>

        {showInstructions ? (
          <div className="coupon-center-instructions">
            <h3>{instructionsTitle}</h3>
            <pre>{instructionsContent}</pre>
          </div>
        ) : null}

        <div className="coupon-center-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.code}
              type="button"
              className={cn('coupon-center-tabs__item', activeStatus === tab.code && 'is-active')}
              onClick={() => onStatusChange(tab.code)}
            >
              {tab.name}
              {tab.count > 0 ? <span className="coupon-center-tabs__count">{tab.count}</span> : null}
            </button>
          ))}
        </div>

        <div className="coupon-center-list-wrap">
          {loading ? (
            <div className="coupon-center-empty">加载中...</div>
          ) : items.length === 0 ? (
            <div className="coupon-center-empty">{emptyText}</div>
          ) : (
            <ul className="coupon-center-list">
              {items.map((item) => (
                <CouponCard key={item.id} coupon={item} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

function CouponCard({ coupon }: { coupon: CouponCenterCoupon }) {
  const isUnused = coupon.status === 'unused'

  return (
    <li
      className={cn(
        'coupon-center-card',
        coupon.status === 'used' && 'is-used',
        coupon.status === 'expired' && 'is-expired',
      )}
    >
      <div className="coupon-center-card__amount">
        <strong>{coupon.discountLabel}</strong>
        <span>{coupon.minAmountLabel}</span>
      </div>
      <div className="coupon-center-card__body">
        <h3>{coupon.title}</h3>
        <p>{coupon.scopeLabel}</p>
        <div className="coupon-center-card__meta">
          <span>有效期至 {coupon.expireTime}</span>
          {coupon.status === 'used' && coupon.usedTime ? <span>使用时间 {coupon.usedTime}</span> : null}
          {!isUnused ? <span className="coupon-center-card__status">{coupon.statusLabel}</span> : null}
        </div>
        {isUnused && coupon.couponCode ? (
          <div className="coupon-center-card__code">券码：{coupon.couponCode}</div>
        ) : null}
      </div>
      {isUnused ? (
        <Link to="/price/vip" className="coupon-center-card__action">
          去使用
        </Link>
      ) : null}
    </li>
  )
}
