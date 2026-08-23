import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { MyDesignToolbar } from '@/components/my-design/MyDesignToolbar'
import { MyDesignGrid } from '@/components/my-design/MyDesignGrid'
import { MyFavoriteGrid } from '@/components/my-design/MyFavoriteGrid'
import { useAuth } from '@/context/AuthContext'
import { useCreateDesignModal } from '@/context/CreateDesignContext'
import {
  useMyDesignActions,
  useMyDesignIndex,
  useMyDesignList,
} from '@/hooks/useMyDesign'
import type { MyDesignItem, MyDesignPageMode, MyDesignViewMode, MyFavoriteItem } from '@/types/myDesign'

function resolveMode(pathname: string): MyDesignPageMode {
  if (pathname.includes('/favorite')) return 'favorite'
  if (pathname.includes('/recycle')) return 'recycle'
  return 'list'
}

export function MyDesignPage() {
  const location = useLocation()
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const { openCreateModal } = useCreateDesignModal()
  const scrollRef = useRef<HTMLDivElement>(null)

  const mode = resolveMode(location.pathname)

  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState('update_time')
  const [typeTab, setTypeTab] = useState('all')
  const [viewMode, setViewMode] = useState<MyDesignViewMode>('grid')

  const { data: indexData, isLoading: indexLoading } = useMyDesignIndex(isLoggedIn)
  const queryParams = useMemo(
    () => ({
      keyword,
      sort,
      typeTab,
      viewMode,
      pageSize: 24,
    }),
    [keyword, sort, typeTab, viewMode],
  )

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useMyDesignList(mode, queryParams, isLoggedIn)

  const {
    rename,
    remove,
    restore,
    permanentDelete,
    move,
    unlike,
  } = useMyDesignActions()

  useEffect(() => {
    if (indexData?.defaultSort) setSort(indexData.defaultSort)
    if (indexData?.defaultTypeTab) setTypeTab(indexData.defaultTypeTab)
    if (indexData?.defaultView) setViewMode(indexData.defaultView as MyDesignViewMode)
  }, [indexData])

  useEffect(() => {
    if (!isLoggedIn) setShowLoginModal(true)
  }, [isLoggedIn, setShowLoginModal])

  const designs = useMemo(
    () => data?.pages.flatMap((page) => page.list as MyDesignItem[]) ?? [],
    [data],
  )

  const favorites = useMemo(
    () => data?.pages.flatMap((page) => page.list as MyFavoriteItem[]) ?? [],
    [data],
  )

  const total = data?.pages[0]?.total ?? 0

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || !hasNextPage || isFetchingNextPage) return
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (!isLoggedIn) {
    return (
      <div className="my-design-page">
        <div className="my-design-login">
          <h2>登录后查看我的设计</h2>
          <p>登录即可管理你的设计作品、收藏与回收站</p>
          <button type="button" onClick={() => setShowLoginModal(true)}>
            立即登录
          </button>
        </div>
      </div>
    )
  }

  if (location.pathname === '/dam-page/my' || location.pathname === '/dam-page/my/') {
    return <Navigate to="/dam-page/my/list" replace />
  }

  return (
    <div className="my-design-page">
      <section className="my-design-main">
        <MyDesignToolbar
          mode={mode}
          navItems={indexData?.navItems ?? []}
          keyword={keywordInput}
          onKeywordChange={setKeywordInput}
          onSearch={() => setKeyword(keywordInput.trim())}
          typeTabs={indexData?.typeTabs ?? []}
          activeTypeTab={typeTab}
          onTypeTabChange={setTypeTab}
          sortOptions={indexData?.sortOptions ?? []}
          activeSort={sort}
          onSortChange={setSort}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          total={total}
          onCreate={openCreateModal}
        />

        <div
          ref={scrollRef}
          className="my-design-main__scroll hide-scrollbar"
          onScroll={handleScroll}
        >
          {mode === 'favorite' ? (
            <MyFavoriteGrid
              items={favorites}
              loading={isLoading || indexLoading}
              onUnlike={(templateId) => unlike.mutate(templateId)}
            />
          ) : (
            <MyDesignGrid
              mode={mode}
              items={designs}
              folders={indexData?.folders ?? []}
              viewMode={viewMode}
              loading={isLoading || indexLoading}
              onCreate={openCreateModal}
              onRename={(id, title) => rename.mutate({ id, title })}
              onDelete={(id) => remove.mutate(id)}
              onRestore={(id) => restore.mutate(id)}
              onPermanentDelete={(id) => permanentDelete.mutate(id)}
              onMove={(id, folderId) => move.mutate({ id, folderId })}
            />
          )}

          {isFetchingNextPage ? (
            <div className="my-design-loading-more">加载中...</div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
