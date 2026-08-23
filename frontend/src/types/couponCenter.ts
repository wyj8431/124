export interface CouponCenterStatusTab {
  code: string
  name: string
  emptyText: string
  count: number
}

export interface CouponCenterIndexData {
  pageTitle: string
  breadcrumbParent: string
  breadcrumbCurrent: string
  backText: string
  instructionsTitle: string
  instructionsContent: string
  tabs: CouponCenterStatusTab[]
}

export interface CouponCenterCoupon {
  id: number
  title: string
  couponCode?: string
  discountType: string
  discountLabel: string
  minAmountLabel: string
  scopeLabel: string
  status: string
  statusLabel: string
  expireTime: string
  usedTime?: string
}

export interface CouponCenterListResult {
  list: CouponCenterCoupon[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
