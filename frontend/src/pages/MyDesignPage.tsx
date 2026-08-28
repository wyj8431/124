import { useEffect, useMemo, useState } from 'react'
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
    isError,
    refetch,
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
          className="my-design-main__scroll hide-scrollbar"
        >
          {mode === 'favorite' ? (
            <MyFavoriteGrid
              items={favorites}
              loading={isLoading || indexLoading}
              loadingMore={isFetchingNextPage}
              hasMore={hasNextPage}
              error={isError ? '设计列表加载失败' : undefined}
              onRetry={() => void refetch()}
              onNearEnd={() => void fetchNextPage()}
              onUnlike={(templateId) => unlike.mutate(templateId)}
            />
          ) : (
            <MyDesignGrid
              mode={mode}
              items={designs}
              folders={indexData?.folders ?? []}
              viewMode={viewMode}
              loading={isLoading || indexLoading}
              loadingMore={isFetchingNextPage}
              hasMore={hasNextPage}
              error={isError ? '设计列表加载失败' : undefined}
              onRetry={() => void refetch()}
              onNearEnd={() => void fetchNextPage()}
              onCreate={openCreateModal}
              onRename={(id, title) => rename.mutate({ id, title })}
              onDelete={(id) => remove.mutate(id)}
              onRestore={(id) => restore.mutate(id)}
              onPermanentDelete={(id) => permanentDelete.mutate(id)}
              onMove={(id, folderId) => move.mutate({ id, folderId })}
            />
          )}
        </div>
      </section>
    </div>
  )
}
