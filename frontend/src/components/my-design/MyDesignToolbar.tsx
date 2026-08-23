import type { FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ChevronDown,
  LayoutGrid,
  List,
  PenLine,
  Search,
  X,
} from 'lucide-react'
import type { MyDesignNavItem, MyDesignOption, MyDesignPageMode, MyDesignViewMode } from '@/types/myDesign'
import { cn } from '@/utils'

interface Props {
  mode: MyDesignPageMode
  navItems: MyDesignNavItem[]
  keyword: string
  onKeywordChange: (value: string) => void
  onSearch: () => void
  typeTabs: MyDesignOption[]
  activeTypeTab: string
  onTypeTabChange: (code: string) => void
  sortOptions: MyDesignOption[]
  activeSort: string
  onSortChange: (code: string) => void
  viewMode: MyDesignViewMode
  onViewModeChange: (mode: MyDesignViewMode) => void
  total?: number
  onCreate: () => void
}

const pageTitles: Record<MyDesignPageMode, string> = {
  list: '我的设计',
  favorite: '我的收藏',
  recycle: '回收站',
}

export function MyDesignToolbar({
  mode,
  navItems,
  keyword,
  onKeywordChange,
  onSearch,
  typeTabs,
  activeTypeTab,
  onTypeTabChange,
  sortOptions,
  activeSort,
  onSortChange,
  viewMode,
  onViewModeChange,
  total,
  onCreate,
}: Props) {
  const location = useLocation()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  const activeSortLabel =
    sortOptions.find((item) => item.code === activeSort)?.name ?? '最近修改'

  return (
    <div className="my-design-toolbar">
      {navItems.length ? (
        <nav className="my-design-toolbar__nav">
          {navItems.map((item) => (
            <Link
              key={item.code}
              to={item.routePath}
              className={cn(
                'my-design-toolbar__nav-item',
                location.pathname === item.routePath && 'my-design-toolbar__nav-item--active',
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      ) : null}

      <div className="my-design-toolbar__top">
        <div className="my-design-toolbar__title-wrap">
          <h2 className="my-design-toolbar__title">{pageTitles[mode]}</h2>
          {typeof total === 'number' ? (
            <span className="my-design-toolbar__count">共 {total} 项</span>
          ) : null}
        </div>

        <div className="my-design-toolbar__actions">
          <form className="my-design-toolbar__search" onSubmit={handleSubmit}>
            <Search className="h-4 w-4 text-[#8f959e]" />
            <input
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              placeholder="搜索设计名称"
              className="my-design-toolbar__search-input"
            />
            {keyword ? (
              <button
                type="button"
                className="my-design-toolbar__search-clear"
                onClick={() => {
                  onKeywordChange('')
                  onSearch()
                }}
                aria-label="清空搜索"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </form>

          {mode === 'list' ? (
            <>
              <div className="my-design-toolbar__sort">
                <button type="button" className="my-design-toolbar__sort-btn">
                  {activeSortLabel}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <div className="my-design-toolbar__sort-menu">
                  {sortOptions.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      className={cn(
                        'my-design-toolbar__sort-item',
                        activeSort === option.code && 'my-design-toolbar__sort-item--active',
                      )}
                      onClick={() => onSortChange(option.code)}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="my-design-toolbar__view-toggle">
                <button
                  type="button"
                  className={cn(
                    'my-design-toolbar__view-btn',
                    viewMode === 'grid' && 'my-design-toolbar__view-btn--active',
                  )}
                  onClick={() => onViewModeChange('grid')}
                  aria-label="网格视图"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={cn(
                    'my-design-toolbar__view-btn',
                    viewMode === 'list' && 'my-design-toolbar__view-btn--active',
                  )}
                  onClick={() => onViewModeChange('list')}
                  aria-label="列表视图"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : null}

          {mode === 'list' ? (
            <button type="button" className="my-design-toolbar__create" onClick={onCreate}>
              <PenLine className="h-4 w-4" />
              创建设计
            </button>
          ) : null}
        </div>
      </div>

      {mode === 'list' ? (
        <div className="my-design-toolbar__tabs">
          {typeTabs.map((tab) => (
            <button
              key={tab.code}
              type="button"
              className={cn(
                'my-design-toolbar__tab',
                activeTypeTab === tab.code && 'my-design-toolbar__tab--active',
              )}
              onClick={() => onTypeTabChange(tab.code)}
            >
              {tab.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
