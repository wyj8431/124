import { Fragment, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  Download,
  Info,
  LayoutTemplate,
  ShieldCheck,
} from 'lucide-react'
import { LoginModal } from '@/components/auth/LoginModal'
import { VipPageHeader } from '@/components/vip/VipPageHeader'
import {
  getCompareByTab,
  getPlansByTab,
  type VipCompareCell,
  type VipPlan,
  type VipTab,
} from '@/data/vipPageData'
import { MEMBERSHIP_PRODUCTS, type MembershipProductId } from '@/data/membershipOrderData'
import { calculateMembershipPrice, getMembershipBillingOptions } from '@/modules/membership/vipMembershipPricing.mjs'
import { useMembershipModal } from '@/context/MembershipModalContext'
import { cn } from '@/utils'

function highlightPriceDesc(text: string) {
  const match = text.match(/^(AI算力)(\d+)(.*)$/)
  if (!match) return text
  return (
    <>
      {match[1]}
      <span className="font-medium text-[#505a71]">{match[2]}</span>
      {match[3]}
    </>
  )
}

function BenefitCheckIcon() {
  return <img src="/vip/pre-check.svg" alt="" className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
}

function VipPlanCard({ plan, onOpen }: { plan: VipPlan; onOpen: () => void }) {
  return (
    <div className="vip-product-item flex flex-col overflow-hidden rounded-2xl border border-white bg-white shadow-[0_20px_40px_rgba(42,49,67,0.06)]">
      <div className="vip-product-card px-6 pb-5 pt-6">
        <div className="vip-product-header">
          <div className="text-xl font-semibold leading-[30px] text-[#1b2337]">{plan.name}</div>
          <div className="mt-1 text-[13px] leading-[22px] text-[#505a71]">{plan.subtitle}</div>
        </div>

        {plan.price !== undefined ? (
          <div className="vip-product-price mt-5 flex items-end gap-0.5">
            <span className="pb-1 text-lg leading-[18px] text-[#1b2337]">¥</span>
            <div className="text-[34px] font-bold leading-[34px] text-[#1b2337]">{plan.price}</div>
            {plan.priceUnit && (
              <div className="pb-1 text-sm leading-[14px] text-[#1b2337]">{plan.priceUnit}</div>
            )}
          </div>
        ) : (
          <div className="mt-5 h-[34px]" />
        )}

        {plan.priceDesc.length > 0 && (
          <div className="vip-product-price-desc mt-2.5 space-y-1">
            {plan.priceDesc.map((line) => (
              <div key={line} className="text-xs leading-[14.4px] text-[#8693ab]">
                {highlightPriceDesc(line)}
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onOpen}
          className={cn(
            'vip-product-button mt-5 flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold transition hover:opacity-90',
            plan.buttonVariant === 'free' && 'bg-[#f1f3f9] text-[#505a71]',
            plan.buttonVariant === 'primary' &&
              'bg-gradient-to-r from-[#69abff] to-[#0773fc] text-white',
            plan.buttonVariant === 'enterprise' &&
              'bg-gradient-to-r from-[#434343] to-[#1d2129] text-[#e8c068]',
          )}
        >
          {plan.buttonText}
        </button>
      </div>

      <div className="vip-product-desc flex-1 border-t border-[#f0f2f5] px-6 py-5">
        {plan.benefits.map((group) => (
          <div key={group.title} className="vip-product-benifits mb-5 last:mb-0">
            <div className="mb-3 text-sm font-semibold leading-[22px] text-[#1b2337]">{group.title}</div>
            <div className="space-y-2.5">
              {group.items.map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <BenefitCheckIcon />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs leading-[14.4px] text-[#505a71]">{item.label}</div>
                    {item.badge && (
                      <span className="mt-1 inline-block rounded bg-[#fff1e6] px-1.5 py-0.5 text-[10px] leading-none text-[#fa8c16]">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductIcon({ icon }: { icon: 'template' | 'download' | 'crown' }) {
  const Icon = icon === 'template' ? LayoutTemplate : icon === 'download' ? Download : Crown
  return <Icon className="h-6 w-6" strokeWidth={2.1} aria-hidden="true" />
}

function MembershipTypeCards({
  selectedId,
  onSelect,
}: {
  selectedId: MembershipProductId
  onSelect: (id: MembershipProductId) => void
}) {
  return (
    <section className="vip-membership-types mx-auto max-w-[1200px] px-6 pt-10" aria-labelledby="membership-types-title">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#1677ff]">按需选择会员方案</p>
          <h1 id="membership-types-title" className="mt-1 text-3xl font-semibold tracking-tight text-[#1b2337]">
            订购会员
          </h1>
        </div>
        <p className="hidden max-w-[360px] text-right text-sm leading-6 text-[#8693ab] sm:block">
          模板、素材下载与 AI 创作能力，一站式对比后立即开通。
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {MEMBERSHIP_PRODUCTS.map((product) => {
          const active = selectedId === product.id
          return (
            <button
              key={product.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(product.id)}
              className={cn(
                'vip-membership-type-card relative flex min-h-[142px] flex-col items-start rounded-lg border bg-white p-5 text-left transition',
                active ? 'border-[#1677ff] shadow-[0_8px_24px_rgba(22,119,255,0.14)]' : 'border-[#e8ebf0] hover:border-[#9ec5ff]',
              )}
            >
              {product.recommended ? (
                <span className="absolute right-4 top-4 rounded-full bg-[#fff1d6] px-2 py-1 text-[11px] font-semibold text-[#b86b00]">
                  推荐
                </span>
              ) : null}
              <span className={cn('mb-4 flex h-10 w-10 items-center justify-center rounded-lg', active ? 'bg-[#e8f2ff] text-[#1677ff]' : 'bg-[#f3f5f8] text-[#505a71]')}>
                <ProductIcon icon={product.icon} />
              </span>
              <strong className="text-base font-semibold text-[#1b2337]">{product.name}</strong>
              <span className="mt-1 text-xs leading-5 text-[#8693ab]">{product.description}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function MembershipTools({ productId }: { productId: MembershipProductId }) {
  const product = MEMBERSHIP_PRODUCTS.find((item) => item.id === productId) ?? MEMBERSHIP_PRODUCTS[0]
  const [expandedTool, setExpandedTool] = useState<string | null>(null)
  return (
    <section className="vip-tools-section mx-auto max-w-[1200px] px-6" aria-labelledby="vip-tools-title">
      <div className="mb-6">
        <p className="text-sm font-medium text-[#1677ff]">效率工具</p>
        <h2 id="vip-tools-title" className="mt-1 text-2xl font-semibold text-[#1b2337]">扩展工具</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {product.tools.map((tool) => {
          const expanded = expandedTool === tool.name
          return (
            <div key={tool.name} className="vip-tool-item rounded-lg border border-[#e8ebf0] bg-white p-4">
              <button
                type="button"
                className="flex w-full items-start gap-3 text-left"
                aria-expanded={expanded}
                onClick={() => setExpandedTool(expanded ? null : tool.name)}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf5ff] text-[#1677ff]">
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-sm font-semibold text-[#1b2337]">{tool.name}</strong>
                  <span className="mt-1 block text-xs text-[#1677ff]">{tool.access}</span>
                </span>
                {expanded ? <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-[#8693ab]" /> : <Info className="mt-1 h-4 w-4 shrink-0 text-[#8693ab]" />}
              </button>
              {expanded ? <p className="mt-3 border-t border-[#f0f2f5] pt-3 text-xs leading-5 text-[#646a73]">{tool.description}</p> : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function AuthorizationSection({ productId }: { productId: MembershipProductId }) {
  const product = MEMBERSHIP_PRODUCTS.find((item) => item.id === productId) ?? MEMBERSHIP_PRODUCTS[0]
  const [expanded, setExpanded] = useState(false)
  return (
    <section className="vip-authorization-section mx-auto max-w-[1200px] px-6" aria-labelledby="vip-authorization-title">
      <div className="rounded-lg border border-[#eadfca] bg-[#fffaf0] p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff0c7] text-[#b86b00]"><ShieldCheck className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#b86b00]">模板会员商用授权说明</p>
            <h2 id="vip-authorization-title" className="mt-1 text-xl font-semibold text-[#1b2337]">用得安心，发布更放心</h2>
            <p className="mt-2 text-sm leading-6 text-[#646a73]">{product.authorization.summary}</p>
          </div>
          <button type="button" className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#b86b00]" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
            {expanded ? '收起' : '展开全文'}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
        {expanded ? (
          <div className="mt-6 grid gap-5 border-t border-[#f1e6d2] pt-5 text-sm sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-[#1b2337]">可商用场景</h3>
              <ul className="mt-3 space-y-2 text-[#646a73]">{product.authorization.allowed.map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#3c9b57]" />{item}</li>)}</ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#1b2337]">禁止使用场景</h3>
              <ul className="mt-3 space-y-2 text-[#646a73]">{product.authorization.prohibited.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e07a35]" />{item}</li>)}</ul>
            </div>
            <p className="sm:col-span-2 text-xs leading-5 text-[#9a835f]">责任提醒：{product.authorization.reminder}</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function MembershipCheckout({
  productId,
  tab,
  onOpen,
}: {
  productId: MembershipProductId
  tab: VipTab
  onOpen: () => void
}) {
  const product = MEMBERSHIP_PRODUCTS.find((item) => item.id === productId) ?? MEMBERSHIP_PRODUCTS[0]
  const plan = product.plans[tab]
  const [years, setYears] = useState<1 | 2>(2)
  const options = useMemo(() => getMembershipBillingOptions({ annualPrice: plan.annualPrice, giftMonthsForTwoYears: 2 }), [plan.annualPrice])
  const selected = options.find((option) => option.years === years) ?? options[1]
  const price = calculateMembershipPrice({ annualPrice: plan.annualPrice, years, giftMonths: years === 2 ? 2 : 0 })

  return (
    <section className="vip-checkout-section mx-auto max-w-[1200px] px-6" aria-labelledby="vip-checkout-title">
      <div className="flex flex-col gap-6 rounded-lg bg-[#172b4d] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-sm text-[#a9c9f7]">{product.name} · {tab === 'team' ? '团队版' : '单人版'}</p>
          <h2 id="vip-checkout-title" className="mt-1 text-2xl font-semibold">立即开通</h2>
          <p className="mt-2 text-sm text-[#c7d5ea]">{plan.description}</p>
        </div>
        <div className="min-w-0 sm:w-[470px]">
          <div className="flex gap-2" role="radiogroup" aria-label="选择订购年限">
            {options.map((option) => (
              <button
                key={option.years}
                type="button"
                role="radio"
                aria-checked={years === option.years}
                onClick={() => setYears(option.years as 1 | 2)}
                className={cn('relative flex-1 rounded-lg border px-4 py-3 text-left transition', years === option.years ? 'border-[#79b2ff] bg-white text-[#1b2337]' : 'border-[#496687] bg-[#243d61] text-white')}
              >
                <strong className="block text-sm">{option.years} 年</strong>
                <span className={cn('mt-1 block text-xs', years === option.years ? 'text-[#646a73]' : 'text-[#c7d5ea]')}>¥{option.totalPrice} · 共{option.totalMonths}个月</span>
                {option.giftMonths > 0 ? <span className="absolute -right-1.5 -top-2 rounded bg-[#ffb43b] px-1.5 py-0.5 text-[10px] font-semibold text-[#4f2c00]">送{option.giftMonths}个月</span> : null}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <span className="text-3xl font-bold">¥{price.totalPrice}</span>
              <span className="ml-2 text-xs text-[#c7d5ea]">约 ¥{price.monthlyEquivalent}/月</span>
              {selected.giftMonths > 0 ? <span className="ml-2 text-xs text-[#ffcf7d]">2年送2个月</span> : null}
            </div>
            <button type="button" onClick={onOpen} className="shrink-0 rounded-lg bg-[#1677ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4096ff]">
              立即开通
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function CompareCellContent({ value }: { value: VipCompareCell }) {
  if (value === 'check') {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M3.5 8.5L6.5 11.5L12.5 5.5"
            stroke="#0773fc"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    )
  }
  if (value === 'dash') {
    return <span className="text-[#c9cdd4]">—</span>
  }
  return <span>{value}</span>
}

function VipCompareSection({ tab }: { tab: VipTab }) {
  const plans = getPlansByTab(tab)
  const tables = getCompareByTab(tab)

  return (
    <section className="vip-compare-section mx-auto mt-16 max-w-[1200px] px-6 pb-20">
      <h2 className="mb-8 text-center text-2xl font-semibold text-[#1b2337]">会员权益对比</h2>

      <div className="overflow-hidden rounded-2xl border border-[#eef0f3] bg-white">
        <div className="overflow-x-auto">
          <table className="vip-compare-table w-full min-w-[960px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#eef0f3] bg-[#fafbfc]">
                <th className="w-[220px] px-5 py-4 text-left font-medium text-[#1b2337]">版本</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="px-4 py-4 text-center font-medium text-[#1b2337]">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tables.map((table, tableIndex) => (
                <Fragment key={`table-${tableIndex}`}>
                  {table.sectionTitle && (
                    <tr className="bg-[#f8f9fb]">
                      <td
                        colSpan={plans.length + 1}
                        className="px-5 py-3 text-left text-sm font-semibold text-[#1b2337]"
                      >
                        {table.sectionTitle}
                      </td>
                    </tr>
                  )}
                  {table.rows.map((row, rowIndex) => (
                    <tr
                      key={`${tableIndex}-${row.label}`}
                      className={cn(
                        'border-b border-[#f0f2f5]',
                        rowIndex === table.rows.length - 1 && tableIndex === tables.length - 1 && 'border-b-0',
                      )}
                    >
                      <td className="px-5 py-3.5 align-top text-[#505a71]">
                        <div>{row.label}</div>
                        {row.subLabel && (
                          <div className="mt-0.5 text-xs text-[#8693ab]">{row.subLabel}</div>
                        )}
                      </td>
                      {row.cells.map((cell, cellIndex) => (
                        <td
                          key={`${row.label}-${cellIndex}`}
                          className="px-4 py-3.5 text-center align-top text-[#505a71]"
                        >
                          <CompareCellContent value={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export function VipPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = (searchParams.get('type') === 'team' ? 'team' : 'individual') as VipTab
  const [tab, setTab] = useState<VipTab>(initialTab)
  const [selectedProductId, setSelectedProductId] = useState<MembershipProductId>('all')
  const { openMembershipModal } = useMembershipModal()

  const plans = useMemo(() => getPlansByTab(tab), [tab])

  useEffect(() => {
    const planId = searchParams.get('plan')
    if (planId) {
      const el = document.getElementById(`vip-plan-${planId}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [searchParams, tab])

  const handleTabChange = (next: VipTab) => {
    setTab(next)
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      params.set('type', next)
      return params
    })
  }

  const handleProductSelect = (id: MembershipProductId) => {
    setSelectedProductId(id)
    window.setTimeout(() => document.getElementById(`vip-product-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  const openProductMembership = (id: MembershipProductId = selectedProductId) => {
    const product = MEMBERSHIP_PRODUCTS.find((item) => item.id === id) ?? MEMBERSHIP_PRODUCTS[0]
    openMembershipModal({ groupCode: tab, tierCode: product.plans[tab].tierCode })
  }

  return (
    <div className="vip-page min-h-full bg-[#f8fafe] bg-[url('/vip/default-back.png')] bg-[length:contain] bg-[position:50%_-70px] bg-no-repeat">
      <VipPageHeader />

      <MembershipTypeCards selectedId={selectedProductId} onSelect={handleProductSelect} />

      <section className="vip-header mx-auto max-w-[1200px] px-6 pt-10">
        <div className="content__sub__tabs mx-auto mt-10 flex h-11 w-full max-w-[592px] rounded-xl border border-white bg-[#f1f3f9] p-1">
          <button
            type="button"
            onClick={() => handleTabChange('individual')}
            className={cn(
              'sub-tab-item flex-1 rounded-[10px] text-sm text-[rgba(0,0,0,0.8)] transition',
              tab === 'individual' && 'is-active bg-white shadow-sm',
            )}
          >
            单人用
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('team')}
            className={cn(
              'sub-tab-item flex-1 rounded-[10px] text-sm text-[rgba(0,0,0,0.8)] transition',
              tab === 'team' && 'is-active bg-white shadow-sm',
            )}
          >
            团队用
          </button>
        </div>
      </section>

      <main className="vip-page__content mx-auto max-w-[1200px] px-6 pt-8">
        <section className="vip-main-wrap grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <div key={plan.id} id={`vip-plan-${plan.id}`}>
              <VipPlanCard plan={plan} onOpen={() => openMembershipModal({ groupCode: tab, tierCode: plan.id === 'basic' ? 'basic' : plan.id === 'pro' ? 'advanced' : plan.id === 'ultimate' ? 'pro' : plan.id === 'team-pro' ? 'advanced' : plan.id === 'team-ultimate' ? 'professional' : 'supreme' })} />
            </div>
          ))}
        </section>

        <VipCompareSection tab={tab} />
        <div className="mt-2 space-y-8 pb-20">
          <div id={`vip-product-${selectedProductId}`} className="scroll-mt-32"><MembershipTools productId={selectedProductId} /></div>
          <AuthorizationSection productId={selectedProductId} />
          <MembershipCheckout productId={selectedProductId} tab={tab} onOpen={() => openProductMembership()} />
        </div>
      </main>

      <LoginModal />
    </div>
  )
}
