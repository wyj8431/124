import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'
import { Sidebar, LoginBanner, HelpFab } from '@/components/layout/LayoutParts'
import { BackToTopButton } from '@/components/layout/BackToTopButton'
import { SidebarWorkspacePanel } from '@/components/layout/SidebarWorkspacePanel'
import { HomeTopBar } from '@/components/layout/HomeTopBar'
import { EnterpriseTopBar } from '@/components/enterprise/EnterpriseTopBar'
import { LoginModal } from '@/components/auth/LoginModal'
import { HomePage } from '@/pages/HomePage'
import { CalendarPage } from '@/pages/CalendarPage'
import { TemplateCenterPage } from '@/pages/TemplateCenterPage'
import { VipPage } from '@/pages/VipPage'
import { OrderCenterPage } from '@/pages/OrderCenterPage'
import { AuthRecordPage } from '@/pages/AuthRecordPage'
import { MessageCenterPage } from '@/pages/MessageCenterPage'
import { CouponCenterPage } from '@/pages/CouponCenterPage'
import { MyDesignPage } from '@/pages/MyDesignPage'
import { EnterpriseAccountOverviewPage } from '@/pages/EnterpriseAccountOverviewPage'
import { DesignIntroPage } from '@/pages/DesignIntroPage'
import { ToolsPage } from '@/pages/ToolsPage'
import { CodeReviewPage } from '@/pages/CodeReviewPage'
import { FeedbackPage } from '@/pages/FeedbackPage'
import { FeedbackSuccessPage } from '@/pages/FeedbackSuccessPage'
import { AiVideoTopicPage } from '@/pages/AiVideoTopicPage'
import { AiPosterTopicPage } from '@/pages/AiPosterTopicPage'
import { KoutuEditorPage } from '@/pages/KoutuEditorPage'
import { DesignEditorPage } from '@/pages/DesignEditorPage'
import { EnterpriseMembersPage } from '@/pages/EnterpriseMembersPage'
import { SupportTicketPage } from '@/pages/SupportTicketPage'
import { RbacPage } from '@/pages/RbacPage'
import { PermissionGate } from '@/components/auth/PermissionGate'
import { SidebarLayoutProvider, useSidebarLayout } from '@/context/SidebarLayoutContext'
import { CreateDesignProvider } from '@/context/CreateDesignContext'
import { MembershipModalProvider } from '@/context/MembershipModalContext'
import { FlagshipUpgradeModalProvider } from '@/context/FlagshipUpgradeModalContext'
import { TeamUpgradeModalProvider } from '@/context/TeamUpgradeModalContext'
import { CreateDesignModal } from '@/components/create-design/CreateDesignModal'
import { MembershipModal } from '@/components/membership/MembershipModal'
import { FlagshipUpgradeModal } from '@/components/enterprise/FlagshipUpgradeModal'
import { TeamUpgradeModal } from '@/components/team-upgrade/TeamUpgradeModal'
import { cn } from '@/utils'

function AppShellInner() {
  const location = useLocation()
  const isEnterprisePage = location.pathname.startsWith('/designtools/enterprise')
  const isEnterpriseOverviewPage = location.pathname === '/designtools/enterprise/accountOverview'
  // 热点日历使用官网的紧凑工作区，只保留左侧图标导航。
  const isCalendarPage = location.pathname === '/calendar'
  const isTemplateCenterPage = location.pathname === '/designtools/designindex'
  const isToolsPage = location.pathname.startsWith('/tools')
  const showTopBar =
    location.pathname === '/' ||
    location.pathname.startsWith('/tools') ||
    location.pathname === '/designtools/designIntroPage' ||
    location.pathname.startsWith('/designtools/aitopic/')
  const isMyPage = location.pathname.startsWith('/dam-page/my')
  const { sidebarOffset } = useSidebarLayout()

  return (
    <div className="flex min-h-full bg-white">
      <Sidebar hideWorkspaceToggle={isCalendarPage || isTemplateCenterPage} />
      {!isCalendarPage && !isTemplateCenterPage && !isToolsPage && <SidebarWorkspacePanel />}
      <div
        className="app-main flex min-h-full flex-1 flex-col transition-[margin-left] duration-200 ease-out"
        style={{ marginLeft: isCalendarPage || isTemplateCenterPage || isToolsPage ? 70 : sidebarOffset }}
      >
        {showTopBar && <HomeTopBar alwaysShowBrand={isToolsPage} brandName={isToolsPage ? '创客贴' : undefined} />}
        {isEnterprisePage && <EnterpriseTopBar />}
        <main data-app-scroll-container className={cn('flex-1 overflow-y-auto bg-white', (isMyPage || isEnterpriseOverviewPage) && 'overflow-hidden')}>
          <Outlet />
        </main>
      </div>
      <LoginBanner hidden={isCalendarPage} />
      <HelpFab />
      <LoginModal />
    </div>
  )
}

function AppShell() {
  return (
    <SidebarLayoutProvider>
      <AppShellInner />
    </SidebarLayoutProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CreateDesignProvider>
        <MembershipModalProvider>
        <FlagshipUpgradeModalProvider>
        <TeamUpgradeModalProvider>
        <Routes>
          <Route path="/price/vip" element={<VipPage />} />
          <Route path="/usercenter" element={<Navigate to="/usercenter/vip" replace />} />
          <Route path="/usercenter/:section" element={<OrderCenterPage />} />
          <Route path="/auth_record/design_record" element={<AuthRecordPage />} />
          <Route path="/message-center" element={<MessageCenterPage />} />
          <Route path="/userquan" element={<CouponCenterPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/feedback/success/:id" element={<FeedbackSuccessPage />} />
          <Route path="/editor/koutu" element={<PermissionGate permission="ai:matting"><KoutuEditorPage /></PermissionGate>} />
          <Route path="/editor/:id" element={<PermissionGate permission="design:edit"><DesignEditorPage /></PermissionGate>} />
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/templates" element={<TemplateCenterPage />} />
            <Route path="/designtools/designindex" element={<TemplateCenterPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/tools/code-review" element={<CodeReviewPage />} />
            <Route path="/dam-page/my" element={<MyDesignPage />} />
            <Route path="/dam-page/my/list" element={<MyDesignPage />} />
            <Route path="/dam-page/my/favorite" element={<MyDesignPage />} />
            <Route path="/dam-page/my/recycle" element={<MyDesignPage />} />
            <Route path="/designtools/enterprise/accountOverview" element={<PermissionGate permission="rbac:manage"><EnterpriseAccountOverviewPage /></PermissionGate>} />
            <Route path="/designtools/enterprise/members" element={<PermissionGate permission="rbac:manage"><EnterpriseMembersPage /></PermissionGate>} />
            <Route path="/support/tickets" element={<PermissionGate permission="support:create"><SupportTicketPage /></PermissionGate>} />
            <Route path="/designtools/designIntroPage" element={<DesignIntroPage />} />
            <Route path="/designtools/aitopic/aishipin" element={<AiVideoTopicPage />} />
            <Route path="/designtools/aitopic/AIhaibao" element={<AiPosterTopicPage />} />
            <Route path="/admin/rbac" element={<PermissionGate permission="rbac:manage"><RbacPage /></PermissionGate>} />
          </Route>
        </Routes>
        <BackToTopButton />
        <CreateDesignModal />
        <MembershipModal />
        <FlagshipUpgradeModal />
        <TeamUpgradeModal />
        </TeamUpgradeModalProvider>
        </FlagshipUpgradeModalProvider>
        </MembershipModalProvider>
      </CreateDesignProvider>
    </BrowserRouter>
  )
}
