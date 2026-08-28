import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const pageSource = await readFile(new URL('../src/pages/VipPage.tsx', import.meta.url), 'utf8')
const productDataSource = await readFile(new URL('../src/data/membershipOrderData.ts', import.meta.url), 'utf8')

test('renders three configured membership types and scrolls the selected type into view', () => {
  assert.match(productDataSource, /id: 'template'/)
  assert.match(productDataSource, /id: 'download'/)
  assert.match(productDataSource, /id: 'all'/)
  assert.match(pageSource, /handleProductSelect/)
  assert.match(pageSource, /scrollIntoView\(\{ behavior: 'smooth', block: 'start' \}\)/)
})

test('keeps tool details and commercial authorization expandable', () => {
  assert.match(pageSource, /aria-expanded=\{expanded\}/)
  assert.match(pageSource, /展开全文/)
  assert.match(pageSource, /禁止使用场景/)
})

test('renders configured one-year and two-year billing options before opening checkout', () => {
  assert.match(pageSource, /getMembershipBillingOptions\(\{ annualPrice: plan\.annualPrice, giftMonthsForTwoYears: 2 \}\)/)
  assert.match(pageSource, /2年送2个月/)
  assert.match(pageSource, /openMembershipModal\(\{ groupCode: tab, tierCode: product\.plans\[tab\]\.tierCode \}\)/)
})
