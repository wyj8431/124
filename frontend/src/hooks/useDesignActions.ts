import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { designApi, templateApi } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { canAccess } from '@/components/auth/PermissionGate'
import { useCreateDesignModal } from '@/context/CreateDesignContext'
import type { DesignTemplate, RecentUsageItem, UserDesign } from '@/types'

export function useDesignActions() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { isLoggedIn, user, setShowLoginModal } = useAuth()
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
      if (!canAccess(user, 'design:create')) {
        alert('当前账号暂无创建设计权限')
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
    [isLoggedIn, user, setShowLoginModal, invalidateSidebar, navigate, openCreateModal],
  )

  const handleOpenDesign = useCallback(
    (design: UserDesign) => {
      if (!isLoggedIn) {
        setShowLoginModal(true)
        return
      }
      if (!canAccess(user, 'design:edit')) {
        alert('当前账号暂无编辑设计权限')
        return
      }
      navigate(`/editor/${design.id}`)
    },
    [isLoggedIn, user, setShowLoginModal, navigate],
  )

  const handleUseTemplate = useCallback(
    async (
      template: Pick<DesignTemplate, 'id' | 'title'> &
        Partial<Pick<DesignTemplate, 'coverUrl' | 'width' | 'height'>>,
    ) => {
      if (!isLoggedIn) {
        setShowLoginModal(true)
        return
      }
      if (!canAccess(user, 'design:create')) {
        alert('当前账号暂无使用模板权限')
        return
      }
      try {
        // 官网同步卡片可能还未写入本地模板库；使用记录失败不应阻断创建副本。
        await templateApi.use(template.id).catch(() => undefined)
        const design = await designApi.create({
          templateId: template.id,
          templateTitle: template.title,
          templateCoverUrl: template.coverUrl,
          title: template.title,
          width: template.width,
          height: template.height,
        })
        invalidateSidebar()
        navigate(`/editor/${design.id}`)
      } catch (error) {
        alert(error instanceof Error ? `创建失败：${error.message}` : '创建失败，请稍后重试')
      }
    },
    [isLoggedIn, user, setShowLoginModal, invalidateSidebar, navigate],
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
      if (!canAccess(user, 'design:create')) {
        alert('当前账号暂无使用模板权限')
        return
      }
      try {
        // 最近使用记录可能来自官网模板，记录接口失败不能阻断创建副本。
        await templateApi.use(item.targetId).catch(() => undefined)
        const design = await designApi.create({
          templateId: item.targetId,
          templateTitle: item.name,
          templateCoverUrl: item.coverUrl,
          title: item.name,
          width: item.width,
          height: item.height,
        })
        invalidateSidebar()
        navigate(`/editor/${design.id}`)
      } catch (error) {
        alert(error instanceof Error ? `创建失败：${error.message}` : '创建失败，请稍后重试')
      }
    },
    [handleCreate, isLoggedIn, user, setShowLoginModal, invalidateSidebar, navigate],
  )

  return {
    handleCreate,
    handleOpenDesign,
    handleUseTemplate,
    handleRecentUsage,
    invalidateSidebar,
    openCreateModal,
  }
}
