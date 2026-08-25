import { Grid3X3 } from 'lucide-react'
import { NotificationBell } from '@/components/common/NotificationBell'
import { VipMembershipMenu } from '@/components/layout/VipMembershipMenu'
import { UserAccountMenu } from '@/components/layout/UserAccountMenu'
import { PlatformBrand } from '@/components/common/PlatformBrand'

/** 企业/团队页顶栏 — 对标官网 accountOverview */
export function EnterpriseTopBar() {
  return (
    <header className="enterprise-top-bar">
      <PlatformBrand className="h-[60px]" />

      <div className="enterprise-top-bar__actions">
        <button type="button" className="enterprise-top-bar__link">
          印刷店
        </button>
        <button type="button" className="enterprise-top-bar__icon-btn" aria-label="应用">
          <Grid3X3 className="h-5 w-5" />
        </button>
        <NotificationBell className="enterprise-top-bar__icon-btn enterprise-top-bar__icon-btn--bell" />
        <VipMembershipMenu />
        <UserAccountMenu variant="avatar" />
      </div>
    </header>
  )
}
