import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Camera, Grid3X3, Search } from 'lucide-react'
import { VipMembershipMenu } from '@/components/layout/VipMembershipMenu'
import { UserAccountMenu } from '@/components/layout/UserAccountMenu'
import { PlatformLogo } from '@/components/common/PlatformLogo'

interface Props {
  keyword: string
  onKeywordChange: (value: string) => void
  onSearch?: () => void
}

export function CalendarPageHeader({ keyword, onKeywordChange, onSearch }: Props) {

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch?.()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#eef0f3] bg-white">
      <div className="mx-auto flex h-[60px] max-w-[1200px] items-center gap-6 px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <PlatformLogo className="h-8 w-8 shadow-sm ring-1 ring-[#ffd660]/45" />
          <span className="text-base font-semibold text-ckt-text">灵图工坊</span>
        </Link>

        <form
          onSubmit={handleSubmit}
          className="flex min-w-0 flex-1 items-center rounded-full border border-[#e5e6eb] bg-[#f5f7fa] px-4 py-2"
        >
          <Search className="h-4 w-4 shrink-0 text-[#8f959e]" />
          <input
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="输入关键词搜索你想要的模板或素材"
            className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[#8f959e]"
          />
          <button type="button" className="shrink-0 text-[#8f959e] hover:text-ckt-primary">
            <Camera className="h-4 w-4" />
          </button>
        </form>

        <div className="flex shrink-0 items-center gap-4">
          <button type="button" className="text-sm text-ckt-text-secondary hover:text-ckt-primary">
            印刷店
          </button>
          <button type="button" className="text-ckt-text-secondary hover:text-ckt-text">
            <Grid3X3 className="h-5 w-5" />
          </button>
          <button type="button" className="relative text-ckt-text-secondary hover:text-ckt-text">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
              9
            </span>
          </button>
          <VipMembershipMenu />
          <UserAccountMenu variant="avatar" />
        </div>
      </div>
    </header>
  )
}
