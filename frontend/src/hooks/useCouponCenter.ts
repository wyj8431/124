import { useQuery } from '@tanstack/react-query'
import { couponCenterApi } from '@/api'

export function useCouponCenterIndex(enabled = true) {
  return useQuery({
    queryKey: ['couponCenter', 'index'],
    queryFn: couponCenterApi.getIndex,
    enabled,
    staleTime: 30_000,
  })
}

export function useCouponCenterList(status: string, enabled = true) {
  return useQuery({
    queryKey: ['couponCenter', 'list', status],
    queryFn: () => couponCenterApi.listCoupons({ status, page: 1, pageSize: 50 }),
    enabled,
  })
}
