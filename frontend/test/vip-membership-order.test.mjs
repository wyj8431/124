import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateMembershipPrice,
  getMembershipBillingOptions,
} from '../src/modules/membership/vipMembershipPricing.mjs'

test('calculates a two-year membership with the configured gift months', () => {
  assert.deepEqual(
    calculateMembershipPrice({ annualPrice: 399, years: 2, giftMonths: 2 }),
    {
      years: 2,
      paidMonths: 24,
      giftMonths: 2,
      totalMonths: 26,
      totalPrice: 798,
      monthlyEquivalent: 30.69,
    },
  )
})

test('builds one-year and promoted two-year billing options from config', () => {
  assert.deepEqual(
    getMembershipBillingOptions({ annualPrice: 149, giftMonthsForTwoYears: 2 }),
    [
      { years: 1, paidMonths: 12, giftMonths: 0, totalMonths: 12, totalPrice: 149, monthlyEquivalent: 12.42 },
      { years: 2, paidMonths: 24, giftMonths: 2, totalMonths: 26, totalPrice: 298, monthlyEquivalent: 11.46 },
    ],
  )
})
