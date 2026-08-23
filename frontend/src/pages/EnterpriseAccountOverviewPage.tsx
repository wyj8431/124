import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { EnterpriseSidebar } from '@/components/enterprise/EnterpriseSidebar'
import { AccountOverviewContent } from '@/components/enterprise/AccountOverviewContent'
import { EnterpriseQuickPanel } from '@/components/enterprise/EnterpriseQuickPanel'
import { useEnterpriseOverview } from '@/hooks/useEnterprise'

export function EnterpriseAccountOverviewPage() {
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const { data, isLoading, isError } = useEnterpriseOverview(isLoggedIn)

  useEffect(() => {
    if (!isLoggedIn) setShowLoginModal(true)
  }, [isLoggedIn, setShowLoginModal])

  if (!isLoggedIn) {
    return (
      <div className="enterprise-page">
        <div className="enterprise-login">
          <h2>登录后管理团队</h2>
          <p>登录即可查看团队账户概览、成员与积分</p>
          <button type="button" onClick={() => setShowLoginModal(true)}>
            立即登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="enterprise-page">
      {isLoading ? (
        <div className="enterprise-page__loading">加载中...</div>
      ) : isError || !data ? (
        <div className="enterprise-page__loading">加载失败，请刷新重试</div>
      ) : (
        <div className="enterprise-body">
          <EnterpriseSidebar navItems={data.navItems} promoCard={data.promoCard} />
          <div className="enterprise-workspace">
            <AccountOverviewContent data={data} />
          </div>
          <EnterpriseQuickPanel items={data.quickAccess} />
        </div>
      )}
    </div>
  )
}
