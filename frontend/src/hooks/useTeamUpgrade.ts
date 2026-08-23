import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { teamUpgradeApi } from '@/api'

export function useTeamUpgradeModalData(enabled: boolean) {
  return useQuery({
    queryKey: ['teamUpgradeModal'],
    queryFn: teamUpgradeApi.getModal,
    enabled,
    staleTime: 60_000,
  })
}

export function useTeamUpgradeSubmit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: teamUpgradeApi.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamUpgradeModal'] })
      queryClient.invalidateQueries({ queryKey: ['enterpriseAccountOverview'] })
    },
  })
}
