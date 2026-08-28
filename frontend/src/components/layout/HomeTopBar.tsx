import { Grid3X3 } from 'lucide-react'
import { NotificationBell } from '@/components/common/NotificationBell'
import { VipMembershipMenu } from '@/components/layout/VipMembershipMenu'
import { UserAccountMenu } from '@/components/layout/UserAccountMenu'
import { PlatformBrand } from '@/components/common/PlatformBrand'
import { useSidebarLayout } from '@/context/SidebarLayoutContext'
import { cn } from '@/utils'

/** 对标官网：工作区收起时顶栏左侧显示品牌，展开时隐藏（品牌在抽屉内） */
export function HomeTopBar({
  alwaysShowBrand = false,
  brandName,
}: {
  alwaysShowBrand?: boolean
  brandName?: string
}) {
  const { workspaceExpanded } = useSidebarLayout()

  return (
    <header className="home-top-bar sticky top-0 z-30 flex h-[68px] w-full shrink-0 items-center justify-between gap-5 bg-white/80 px-6 backdrop-blur-sm xl:px-10 2xl:px-12">
      <div className={cn('min-w-0 shrink-0', workspaceExpanded && !alwaysShowBrand && 'hidden')}>
        <PlatformBrand className="h-[68px]" brandName={brandName} />
      </div>

      <div className="ml-auto flex items-center gap-5">
        <button type="button" className="text-sm text-[#505a71] transition hover:text-[#0773fc]">
        AI图表
      </button>
      <button type="button" className="text-sm text-[#505a71] transition hover:text-[#0773fc]">
        印刷店
      </button>
      <button type="button" className="text-[#505a71] transition hover:text-[#1b2337]" aria-label="应用">
        <Grid3X3 className="h-5 w-5" />
      </button>
      <NotificationBell className="text-[#505a71] transition hover:text-[#1b2337]" />
      <VipMembershipMenu />
      <UserAccountMenu />
      </div>
    </header>
  )
}
