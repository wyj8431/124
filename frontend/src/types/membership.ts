export interface MembershipUser {
  displayName: string
  avatar?: string
  levelLabel: string
  slogan: string
}

export interface MembershipSku {
  id: number
  name: string
  price: number
  originalPrice?: number | null
  badgeText?: string | null
  footerText?: string | null
  perMonthText?: string | null
  durationMonths: number
  autoRenew?: boolean
  autoRenewTip?: string | null
  perPerson?: boolean
}

export interface MembershipBenefit {
  title: string
  description: string
  icon: string
}

export interface MembershipTier {
  id: number
  code: string
  name: string
  description: string
  minSeats: number
  maxSeats: number
  skus: MembershipSku[]
  benefits: MembershipBenefit[]
}

export interface MembershipGroup {
  code: 'individual' | 'team'
  title: string
  subtitle: string
  minSeats: number
  maxSeats: number
  tiers: MembershipTier[]
}

export interface MembershipCheckoutData {
  user: MembershipUser
  groups: MembershipGroup[]
}

export interface MemberOrderData {
  orderId: number
  orderNo: string
  totalPrice: number
  originalPrice?: number | null
  savedAmount?: number | null
  validUntilLabel: string
  autoRenewTip?: string | null
  qrCodeUrl: string
  payMethod: string
  status: string
}
