import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PlatformBrand } from '@/components/common/PlatformBrand'
import { UserAccountMenu } from '@/components/layout/UserAccountMenu'

const NAV_ITEMS = ['首页', '模板素材', 'AI工具箱', '定制设计', '下载APP']

export function VipPageHeader() {

  return (
    <header className="vip-page-header sticky top-0 z-40 bg-white">
      <div className="mx-auto flex h-[60px] max-w-[1200px] items-center gap-8 px-6">
        <PlatformBrand />

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item, index) => (
            <Link
              key={item}
              to={index === 0 ? '/' : '#'}
              className="text-sm text-[#505a71] transition hover:text-[#0773fc]"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <UserAccountMenu />
        </div>
      </div>

      <div className="border-t border-[#eef0f3] bg-white">
        <div className="mx-auto flex h-[56px] max-w-[1200px] items-center px-6">
          <div className="flex h-10 w-full max-w-[480px] items-center gap-2 rounded-lg border border-[#e5e8ef] bg-[#f8f9fb] px-3">
            <Search className="h-4 w-4 shrink-0 text-[#8693ab]" />
            <input
              type="text"
              placeholder="搜索你想要的模板"
              className="w-full bg-transparent text-sm text-[#1b2337] outline-none placeholder:text-[#8693ab]"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
