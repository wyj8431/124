import { Link } from 'react-router-dom'
import { Bell, Camera, ChevronDown, MoreHorizontal } from 'lucide-react'
import { PlatformBrand } from '@/components/common/PlatformBrand'
import { UserAccountMenu } from '@/components/layout/UserAccountMenu'
import { VipMembershipMenu } from '@/components/layout/VipMembershipMenu'

const NAV_ITEMS = [
  { name: '首页', to: '/' },
  { name: 'AI工具箱', to: '/tools' },
  { name: '定制设计', to: '/designtools/designIntroPage' },
  { name: '印刷店', to: '#' },
  { name: '下载APP', to: '#' },
]

export function OrderCenterHeader() {
  return (
    <header className="order-center-header">
      <div className="order-center-header__inner">
        <div className="order-center-header__brand">
          <PlatformBrand />
          <button type="button" className="order-center-header__edition">
            个人版
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        <nav className="order-center-header__nav">
          {NAV_ITEMS.map((item) => (
            <Link key={item.name} to={item.to} className="order-center-header__nav-link">
              {item.name}
            </Link>
          ))}
          <button type="button" className="order-center-header__more" aria-label="更多">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </nav>

        <div className="order-center-header__search">
          <input type="text" placeholder="搜索你想要的模板" />
          <Camera className="order-center-header__camera" />
        </div>

        <div className="order-center-header__actions">
          <VipMembershipMenu />
          <Link to="/designtools/enterprise/accountOverview" className="order-center-header__enterprise">
            企业服务
          </Link>
          <Link to="/message-center" className="order-center-header__bell" aria-label="消息">
            <Bell className="h-5 w-5" />
          </Link>          <UserAccountMenu variant="avatar" />
        </div>
      </div>
    </header>
  )
}
