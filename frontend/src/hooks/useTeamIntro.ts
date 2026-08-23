import { useQuery } from '@tanstack/react-query'
import { teamIntroApi } from '@/api'

export function useTeamIntro() {
  return useQuery({
    queryKey: ['teamIntro'],
    queryFn: teamIntroApi.getIndex,
    staleTime: 60_000,
  })
}
