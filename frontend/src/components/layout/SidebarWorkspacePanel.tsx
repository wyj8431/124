import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PenLine, Users } from 'lucide-react'
import { homeApi } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { useDesignActions } from '@/hooks/useDesignActions'
import { useCreateDesignModal } from '@/context/CreateDesignContext'
import { useSidebarLayout } from '@/context/SidebarLayoutContext'
import { PlatformBrand } from '@/components/common/PlatformBrand'
import { coverFallback } from '@/utils'
import { cn } from '@/utils'

export const SIDEBAR_NAV_WIDTH = 70
export const SIDEBAR_PANEL_WIDTH = 230
export const SIDEBAR_TOTAL_WIDTH = SIDEBAR_NAV_WIDTH + SIDEBAR_PANEL_WIDTH

function LoginHint({
  onLogin,
  children,
}: {
  onLogin: () => void
  children: ReactNode
}) {
  return (
    <div className="workspace-empty">
      <button type="button" onClick={onLogin} className="workspace-empty__text">
        <span className="workspace-empty__link">登录</span>
        {children}
      </button>
    </div>
  )
}

/** 对标官网 .h-drawer：Logo + 创建设计 + 最近设计 + 最近使用 + 团队版入口 */
export function SidebarWorkspacePanel() {
  const navigate = useNavigate()
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const { workspaceExpanded } = useSidebarLayout()
  const { handleOpenDesign, handleRecentUsage } = useDesignActions()
  const { openCreateModal } = useCreateDesignModal()

  const { data: designs, isLoading: designsLoading } = useQuery({
    queryKey: ['recentDesigns', isLoggedIn],
    queryFn: () => homeApi.getRecentDesigns(8),
    staleTime: 30_000,
  })

  const { data: recentUsage, isLoading: usageLoading } = useQuery({
    queryKey: ['recentUsage', isLoggedIn],
    queryFn: () => homeApi.getRecentUsage(8),
    staleTime: 30_000,
  })

  const promptLogin = () => setShowLoginModal(true)

  return (
    <section
      className={cn(
        'workspace-drawer fixed left-[70px] top-0 z-40 flex h-full w-[230px] flex-col bg-white',
        workspaceExpanded ? 'workspace-drawer--open' : 'workspace-drawer--closed',
      )}
      aria-label="工作区"
      aria-hidden={!workspaceExpanded}
    >
      <div
        className={cn(
          'workspace-drawer__logo-wrap overflow-hidden transition-all duration-200',
          workspaceExpanded ? 'max-h-[68px] opacity-100' : 'max-h-0 opacity-0',
        )}
        aria-hidden={!workspaceExpanded}
      >
        <PlatformBrand className="workspace-drawer__logo h-[68px] px-4" />
      </div>

      <button type="button" className="workspace-create-btn" onClick={openCreateModal}>
        <span className="workspace-create-btn__icon" aria-hidden="true">
          <PenLine className="h-4 w-4 text-[#0773fc]" strokeWidth={2.2} />
        </span>
        <span className="workspace-create-btn__label">创建设计</span>
      </button>

      <div className="workspace-drawer__main min-h-0 flex-1">
        <div className="workspace-drawer__scroll hide-scrollbar">
          <section className="workspace-section">
            <h2 className="workspace-section__title">最近设计</h2>
            <div className="workspace-section__body">
              {!isLoggedIn ? (
                <LoginHint onLogin={promptLogin}>查看你最新的设计</LoginHint>
              ) : designsLoading ? (
                <div className="space-y-2 px-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 py-1">
                      <div className="h-10 w-10 animate-pulse rounded bg-[#f2f4f8]" />
                      <div className="h-3 flex-1 animate-pulse rounded bg-[#f2f4f8]" />
                    </div>
                  ))}
                </div>
              ) : designs?.length ? (
                <ul className="space-y-0.5">
                  {designs.map((design) => (
                    <li key={design.id}>
                      <button
                        type="button"
                        onClick={() => handleOpenDesign(design)}
                        className="workspace-design-item"
                      >
                        <img
                          src={design.coverUrl || coverFallback(`design-${design.id}`, 80, 80)}
                          alt=""
                          className="workspace-design-item__thumb"
                          loading="lazy"
                        />
                        <span className="workspace-design-item__title">{design.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="workspace-empty workspace-empty--plain">
                  <p className="m-0 text-center text-xs leading-relaxed text-[#505a71]">
                    暂无设计，点击上方创建
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="workspace-section workspace-section--usage">
            <h2 className="workspace-section__title">最近使用</h2>
            <div className="workspace-section__body">
              {!isLoggedIn ? (
                <LoginHint onLogin={promptLogin}>
                  <>
                    {' '}
                    查看最近使用过的
                    <br />
                    设计场景或工具
                  </>
                </LoginHint>
              ) : usageLoading ? (
                <div className="space-y-2 px-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-3 animate-pulse rounded bg-[#f2f4f8]" />
                  ))}
                </div>
              ) : recentUsage?.length ? (
                <ul className="space-y-0.5">
                  {recentUsage.map((item) => (
                    <li key={`${item.targetType}-${item.targetId}-${item.id}`}>
                      <button
                        type="button"
                        onClick={() => handleRecentUsage(item)}
                        className="workspace-usage-item"
                      >
                        <span className="workspace-usage-item__icon" aria-hidden="true" />
                        <span className="workspace-usage-item__label">{item.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <LoginHint onLogin={promptLogin}>
                  <>
                    {' '}
                    查看最近使用过的
                    <br />
                    设计场景或工具
                  </>
                </LoginHint>
              )}
            </div>
          </section>
        </div>

        <button
          type="button"
          className="workspace-team-card"
          onClick={() => navigate('/designtools/designIntroPage')}
        >
          <span className="workspace-team-card__icon" aria-hidden="true">
            <Users className="h-4 w-4 text-[#0773fc]" />
          </span>
          <span className="workspace-team-card__text">
            <span className="workspace-team-card__title">免费升级团队版</span>
            <span className="workspace-team-card__subtitle">体验多人在线协作</span>
          </span>
        </button>
      </div>
    </section>
  )
}
