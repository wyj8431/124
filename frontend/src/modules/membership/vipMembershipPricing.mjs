/**
 * 工单编号：网站学院-All poster低代码开发平台项目-订购会员任务工单
 * Keep billing math independent from the page so pricing changes stay configuration-driven.
 */
export function calculateMembershipPrice({ annualPrice, years, giftMonths = years === 2 ? 2 : 0 }) {
  const paidMonths = years * 12
  const totalMonths = paidMonths + giftMonths
  const totalPrice = annualPrice * years

  return {
    years,
    paidMonths,
    giftMonths,
    totalMonths,
    totalPrice,
    monthlyEquivalent: Number((totalPrice / totalMonths).toFixed(2)),
  }
}

export function getMembershipBillingOptions({ annualPrice, giftMonthsForTwoYears = 2 }) {
  return [
    calculateMembershipPrice({ annualPrice, years: 1, giftMonths: 0 }),
    calculateMembershipPrice({ annualPrice, years: 2, giftMonths: giftMonthsForTwoYears }),
  ]
}
