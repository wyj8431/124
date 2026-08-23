import { Fragment, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LoginModal } from '@/components/auth/LoginModal'
import { VipPageHeader } from '@/components/vip/VipPageHeader'
import {
  getCompareByTab,
  getPlansByTab,
  type VipCompareCell,
  type VipPlan,
  type VipTab,
} from '@/data/vipPageData'
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

function VipPlanCard({ plan }: { plan: VipPlan }) {
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

  return (
    <div className="vip-page min-h-full bg-[#f8fafe] bg-[url('/vip/default-back.png')] bg-[length:contain] bg-[position:50%_-70px] bg-no-repeat">
      <VipPageHeader />

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
              <VipPlanCard plan={plan} />
            </div>
          ))}
        </section>

        <VipCompareSection tab={tab} />
      </main>

      <LoginModal />
    </div>
  )
}
