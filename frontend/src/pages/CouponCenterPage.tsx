import { useEffect, useMemo, useState } from 'react'
import { LoginModal } from '@/components/auth/LoginModal'
import { CouponCenterBreadcrumb, CouponCenterPanel } from '@/components/coupon-center/CouponCenterParts'
import { OrderCenterHeader } from '@/components/order-center/OrderCenterHeader'
import { useAuth } from '@/context/AuthContext'
import { useCouponCenterIndex, useCouponCenterList } from '@/hooks/useCouponCenter'

export function CouponCenterPage() {
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const [status, setStatus] = useState('unused')

  const { data: indexData, isLoading: indexLoading, isError: indexError } = useCouponCenterIndex(isLoggedIn)
  const listQuery = useCouponCenterList(status, isLoggedIn && !!indexData)

  useEffect(() => {
    if (!isLoggedIn) setShowLoginModal(true)
  }, [isLoggedIn, setShowLoginModal])

  const emptyText = useMemo(() => {
    const tab = indexData?.tabs.find((t) => t.code === status)
    return tab?.emptyText ?? '暂无优惠券'
  }, [indexData, status])

  const items = listQuery.data?.list ?? []

  return (
    <div className="coupon-center-page">
      <OrderCenterHeader />
      <div className="coupon-center-page__content">
        {!isLoggedIn ? (
          <div className="coupon-center-login">
            <h2>登录后查看优惠券</h2>
            <p>会员优惠、活动券将在此展示</p>
            <button type="button" className="order-btn order-btn--primary" onClick={() => setShowLoginModal(true)}>
              立即登录
            </button>
          </div>
        ) : indexError ? (
          <div className="coupon-center-login">加载失败，请刷新重试</div>
        ) : indexLoading || !indexData ? (
          <div className="coupon-center-login">加载中...</div>
        ) : (
          <>
            <CouponCenterBreadcrumb
              parent={indexData.breadcrumbParent}
              current={indexData.breadcrumbCurrent}
            />
            <CouponCenterPanel
              pageTitle={indexData.pageTitle}
              backText={indexData.backText}
              tabs={indexData.tabs}
              activeStatus={status}
              instructionsTitle={indexData.instructionsTitle}
              instructionsContent={indexData.instructionsContent}
              items={items}
              loading={listQuery.isLoading}
              emptyText={emptyText}
              onStatusChange={setStatus}
            />
          </>
        )}
      </div>
      <LoginModal />
    </div>
  )
}
