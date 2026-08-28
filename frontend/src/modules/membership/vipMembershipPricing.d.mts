export interface MembershipPriceConfig {
  annualPrice: number
  giftMonthsForTwoYears?: number
}

export interface MembershipBillingOption {
  years: 1 | 2
  paidMonths: number
  giftMonths: number
  totalMonths: number
  totalPrice: number
  monthlyEquivalent: number
}

export declare function calculateMembershipPrice(input: {
  annualPrice: number
  years: number
  giftMonths?: number
}): MembershipBillingOption

export declare function getMembershipBillingOptions(
  input: MembershipPriceConfig,
): MembershipBillingOption[]
