import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { myDesignApi } from '@/api'
import type { MyDesignPageMode, MyDesignQuery, MyDesignViewMode } from '@/types/myDesign'

export function useMyDesignIndex(enabled: boolean) {
  return useQuery({
    queryKey: ['myDesignIndex'],
    queryFn: myDesignApi.getIndex,
    enabled,
    staleTime: 60_000,
  })
}

export function useMyDesignList(
  mode: MyDesignPageMode,
  params: MyDesignQuery,
  enabled: boolean,
) {
  return useInfiniteQuery({
    queryKey: ['myDesignList', mode, params],
    queryFn: ({ pageParam = 1 }) => {
      if (mode === 'favorite') {
        return myDesignApi.listFavorites({
          page: pageParam,
          pageSize: params.pageSize ?? 24,
          keyword: params.keyword,
        })
      }
      if (mode === 'recycle') {
        return myDesignApi.listRecycle({
          page: pageParam,
          pageSize: params.pageSize ?? 24,
          keyword: params.keyword,
        })
      }
      return myDesignApi.listDesigns({
        page: pageParam,
        pageSize: params.pageSize ?? 24,
        keyword: params.keyword,
        sort: params.sort,
        typeTab: params.typeTab,
        folderId: params.folderId ?? undefined,
        viewMode: params.viewMode,
      })
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    enabled,
  })
}

export function useMyDesignActions() {
  const qc = useQueryClient()

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['myDesignIndex'] })
    qc.invalidateQueries({ queryKey: ['myDesignList'] })
    qc.invalidateQueries({ queryKey: ['recentDesigns'] })
  }

  const rename = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) =>
      myDesignApi.rename(id, title),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: number) => myDesignApi.delete(id),
    onSuccess: invalidate,
  })

  const restore = useMutation({
    mutationFn: (id: number) => myDesignApi.restore(id),
    onSuccess: invalidate,
  })

  const permanentDelete = useMutation({
    mutationFn: (id: number) => myDesignApi.permanentDelete(id),
    onSuccess: invalidate,
  })

  const move = useMutation({
    mutationFn: ({ id, folderId }: { id: number; folderId: number | null }) =>
      myDesignApi.move(id, folderId),
    onSuccess: invalidate,
  })

  const createFolder = useMutation({
    mutationFn: (name: string) => myDesignApi.createFolder(name),
    onSuccess: invalidate,
  })

  const deleteFolder = useMutation({
    mutationFn: (id: number) => myDesignApi.deleteFolder(id),
    onSuccess: invalidate,
  })

  const unlike = useMutation({
    mutationFn: (templateId: number) => myDesignApi.unlike(templateId),
    onSuccess: invalidate,
  })

  return {
    rename,
    remove,
    restore,
    permanentDelete,
    move,
    createFolder,
    deleteFolder,
    unlike,
  }
}

export function formatDesignTime(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export type { MyDesignViewMode }
