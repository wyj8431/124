import { useQuery } from '@tanstack/react-query'
import { enterpriseApi } from '@/api'

export function useEnterpriseOverview(enabled = true) {
  return useQuery({
    queryKey: ['enterprise', 'accountOverview'],
    queryFn: enterpriseApi.getAccountOverview,
    enabled,
    staleTime: 60_000,
  })
}
