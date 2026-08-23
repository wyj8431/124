import {
  Home,
  LayoutTemplate,
  Sparkles,
  PlusSquare,
  FolderOpen,
  Users,
  Grid3X3,
  Search,
  Camera,
  ChevronRight,
  X,
  PanelLeft,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { teamIntroApi } from '@/api'
import { VipMembershipMenu } from '@/components/layout/VipMembershipMenu'
import { UserAccountMenu } from '@/components/layout/UserAccountMenu'
import { PlatformLogo } from '@/components/common/PlatformLogo'
import { useDesignActions } from '@/hooks/useDesignActions'
import { useSidebarLayout } from '@/context/SidebarLayoutContext'
import { cn } from '@/utils'

const navItems = [
  { icon: Home, label: '首页', to: '/' },
  { icon: LayoutTemplate, label: '模板', to: '/templates' },
  { icon: Sparkles, label: 'AI工具', to: '/tools' },
  { icon: PlusSquare, label: '创建', action: 'create' as const },
  { icon: FolderOpen, label: '我的', to: '/dam-page/my/list' },
  { icon: Users, label: '团队', to: '/designtools/designIntroPage', badge: true as const },
]

/** 对标官网 .sider：70px 图标导航 */
export function Sidebar() {
  const location = useLocation()
  const { handleCreate } = useDesignActions()
  const { workspaceExpanded, toggleWorkspace } = useSidebarLayout()
  const { data: teamIntro } = useQuery({
    queryKey: ['teamIntro'],
    queryFn: teamIntroApi.getIndex,
    staleTime: 60_000,
  })

  return (
    <aside className="sider fixed left-0 top-0 z-50 flex h-full w-[70px] flex-col items-center bg-white pb-2">
      <button
        type="button"
        className={cn('sider-expand', workspaceExpanded && 'sider-expand--open')}
        aria-label={workspaceExpanded ? '收起工作区' : '展开工作区'}
        aria-expanded={workspaceExpanded}
        title={workspaceExpanded ? '收起工作区' : '展开工作区'}
        onClick={toggleWorkspace}
      >
        <PanelLeft className="h-5 w-5 text-[#505a71] transition-transform duration-200" />
      </button>

      <nav className="sider-nav flex flex-1 flex-col items-center">
        {navItems.map((item) => {
          const active =
            item.to === '/'
              ? location.pathname === '/'
              : item.to != null &&
                (item.to.startsWith('/dam-page/my')
                  ? location.pathname.startsWith('/dam-page/my')
                  : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`))

          const className = cn('nav-item', active && 'nav-item--active')

          const inner = (
            <>
              <span className={cn('nav-item__icon-wrap', active && 'nav-item__icon-wrap--active')}>
                <span className={cn('nav-item__icon', active && 'nav-item__icon--active')}>
                  <item.icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
                </span>
                {'badge' in item && item.badge && teamIntro?.teamNavBadge ? (
                  <span className="nav-item__badge">{teamIntro.teamNavBadge}</span>
                ) : null}
              </span>
              <span className="nav-item__label">{item.label}</span>
            </>
          )

          if (item.action === 'create') {
            return (
              <button key={item.label} type="button" className={className} onClick={() => handleCreate()}>
                {inner}
              </button>
            )
          }

          if (item.to) {
            return (
              <Link key={item.label} to={item.to} className={className}>
                {inner}
              </Link>
            )
          }

          return (
            <button key={item.label} type="button" className={className}>
              {inner}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export function TopHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-ckt-border bg-white/90 px-6 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <PlatformLogo className="h-8 w-8 shadow-sm ring-1 ring-[#ffd660]/45" />
        <span className="text-base font-semibold text-ckt-text">灵图工坊</span>
      </div>

      <div className="flex items-center gap-5">
        <button className="text-sm text-ckt-text-secondary transition hover:text-ckt-primary">AI图表</button>
        <button className="text-sm text-ckt-text-secondary transition hover:text-ckt-primary">印刷店</button>
        <button className="text-ckt-text-secondary transition hover:text-ckt-text">
          <Grid3X3 className="h-5 w-5" />
        </button>
        <VipMembershipMenu />
        <UserAccountMenu />
      </div>
    </header>
  )
}

export function LoginBanner() {
  const { isLoggedIn, setShowLoginModal } = useAuth()
  if (isLoggedIn) return null

  const benefits = [
    '100万+模板每日更新',
    '1亿+可商用素材',
    '注册登录AI工具免费试用',
    '注册登录立享免费模板',
  ]

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-120px)] max-w-[960px] -translate-x-1/2 items-center justify-between rounded-2xl bg-[#1d2129]/92 px-6 py-3.5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-6">
        <span className="whitespace-nowrap text-sm font-medium text-white">
          一键注册登录，免费获海量设计营销方案
        </span>
        <ul className="hidden items-center gap-4 lg:flex">
          {benefits.map((b) => (
            <li key={b} className="flex items-center gap-1.5 text-xs text-white/80">
              <span className="text-green-400">✓</span>
              {b}
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => setShowLoginModal(true)}
        className="shrink-0 rounded-lg bg-ckt-primary px-6 py-2 text-sm font-medium text-white transition hover:bg-ckt-primary-hover"
      >
        立即登录
      </button>
    </div>
  )
}

export { HelpFab } from '@/components/layout/HelpFab'

export { Search, Camera, ChevronRight, X }
