import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { designApi, templateApi } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { useCreateDesignModal } from '@/context/CreateDesignContext'
import type { RecentUsageItem, UserDesign } from '@/types'

export function useDesignActions() {
  const queryClient = useQueryClient()
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const { openCreateModal } = useCreateDesignModal()

  const invalidateSidebar = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['recentDesigns'] })
    queryClient.invalidateQueries({ queryKey: ['recentUsage'] })
  }, [queryClient])

  const handleCreate = useCallback(
    async (sceneId?: number) => {
      if (sceneId == null) {
        openCreateModal()
        return
      }
      if (!isLoggedIn) {
        setShowLoginModal(true)
        return
      }
      try {
        await designApi.create({ sceneId, title: '未命名设计' })
        invalidateSidebar()
      } catch {
        alert('创建失败，请确认后端已启动')
      }
    },
    [isLoggedIn, setShowLoginModal, invalidateSidebar, openCreateModal],
  )

  const handleOpenDesign = useCallback(
    (design: UserDesign) => {
      if (!isLoggedIn) {
        setShowLoginModal(true)
        return
      }
      alert(`即将打开设计「${design.title}」`)
    },
    [isLoggedIn, setShowLoginModal],
  )

  const handleRecentUsage = useCallback(
    async (item: RecentUsageItem) => {
      if (item.targetType === 'scene') {
        await handleCreate(item.targetId)
        return
      }
      if (!isLoggedIn) {
        setShowLoginModal(true)
        return
      }
      try {
        await templateApi.use(item.targetId)
        await designApi.create({ templateId: item.targetId, title: item.name })
        invalidateSidebar()
      } catch {
        alert('操作失败，请确认后端已启动')
      }
    },
    [handleCreate, isLoggedIn, setShowLoginModal, invalidateSidebar],
  )

  return {
    handleCreate,
    handleOpenDesign,
    handleRecentUsage,
    invalidateSidebar,
    openCreateModal,
  }
}
