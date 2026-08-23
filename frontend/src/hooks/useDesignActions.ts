import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { designApi, templateApi } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { useCreateDesignModal } from '@/context/CreateDesignContext'
import type { RecentUsageItem, UserDesign } from '@/types'

export function useDesignActions() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
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
        const design = await designApi.create({ sceneId, title: '未命名设计' })
        invalidateSidebar()
        navigate(`/editor/${design.id}`)
      } catch {
        alert('创建失败，请确认后端已启动')
      }
    },
    [isLoggedIn, setShowLoginModal, invalidateSidebar, navigate, openCreateModal],
  )

  const handleOpenDesign = useCallback(
    (design: UserDesign) => {
      if (!isLoggedIn) {
        setShowLoginModal(true)
        return
      }
      navigate(`/editor/${design.id}`)
    },
    [isLoggedIn, setShowLoginModal, navigate],
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
        const design = await designApi.create({ templateId: item.targetId, title: item.name })
        invalidateSidebar()
        navigate(`/editor/${design.id}`)
      } catch {
        alert('操作失败，请确认后端已启动')
      }
    },
    [handleCreate, isLoggedIn, setShowLoginModal, invalidateSidebar, navigate],
  )

  return {
    handleCreate,
    handleOpenDesign,
    handleRecentUsage,
    invalidateSidebar,
    openCreateModal,
  }
}
