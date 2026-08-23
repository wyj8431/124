import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { messageCenterApi } from '@/api'

export function useMessageCenterIndex(enabled = true) {
  return useQuery({
    queryKey: ['messageCenter', 'index'],
    queryFn: messageCenterApi.getIndex,
    enabled,
    staleTime: 30_000,
  })
}

export function useMessageCenterList(category: string, enabled = true) {
  return useQuery({
    queryKey: ['messageCenter', 'list', category],
    queryFn: () => messageCenterApi.listMessages({ category, page: 1, pageSize: 50 }),
    enabled,
  })
}

export function useMessageCenterDetail(messageId: number | null, enabled = true) {
  return useQuery({
    queryKey: ['messageCenter', 'detail', messageId],
    queryFn: () => messageCenterApi.getMessage(messageId!),
    enabled: enabled && messageId != null,
  })
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: messageCenterApi.markRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['messageCenter'] })
      void queryClient.invalidateQueries({ queryKey: ['accountPanel'] })
    },
  })
}

export function useMarkAllMessagesRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: messageCenterApi.markAllRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['messageCenter'] })
      void queryClient.invalidateQueries({ queryKey: ['accountPanel'] })
    },
  })
}
