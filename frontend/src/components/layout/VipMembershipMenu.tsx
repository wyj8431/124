import { useRef, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Crown, User, Users } from 'lucide-react'
import { memberApi } from '@/api'
import { useMembershipModal } from '@/context/MembershipModalContext'
import { planLinkToTab } from '@/data/vipPageData'
import type { MemberPlanGroup, MemberPlanItem } from '@/types'
import { cn } from '@/utils'

function ShieldIcon({ style }: { style: string }) {
  const isEnterprise = style === 'enterprise'
  const isOrange = style === 'orange'

  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M14 2.5L5 6.2v7.8c0 5.2 3.6 10.1 9 11.5 5.4-1.4 9-6.3 9-11.5V6.2L14 2.5z"
        fill={
          isEnterprise
            ? 'url(#shield-enterprise)'
            : isOrange
              ? 'url(#shield-orange)'
              : 'url(#shield-blue)'
        }
      />
      <path
        d="M10.5 14.2l2.2 2.2 5.1-5.4"
        stroke={isEnterprise ? '#E8C068' : '#fff'}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="shield-blue" x1="5" y1="2" x2="23" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4BA3FF" />
          <stop offset="1" stopColor="#1677FF" />
        </linearGradient>
        <linearGradient id="shield-orange" x1="5" y1="2" x2="23" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB84D" />
          <stop offset="1" stopColor="#FA8C16" />
        </linearGradient>
        <linearGradient id="shield-enterprise" x1="5" y1="2" x2="23" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#434343" />
          <stop offset="1" stopColor="#1D2129" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function GroupHeaderIcon({ code }: { code: string }) {
  if (code === 'team') {
    return (
      <div className="flex h-5 w-5 items-center justify-center text-[#FA8C16]">
        <Users className="h-4 w-4" strokeWidth={2.2} />
      </div>
    )
  }
  return (
    <div className="flex h-5 w-5 items-center justify-center text-[#1677FF]">
      <User className="h-4 w-4" strokeWidth={2.2} />
    </div>
  )
}

function PlanRow({ plan, onClick }: { plan: MemberPlanItem; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition hover:bg-[#f5f7fa]"
    >
      <div className="mt-0.5 shrink-0">
        <ShieldIcon style={plan.iconStyle} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium leading-5 text-[#1f2329]">{plan.name}</div>
        <div className="mt-0.5 text-[11px] leading-[18px] text-[#8f959e]">{plan.description}</div>
      </div>
    </button>
  )
}

function DropdownPanel({
  groups,
  onPlanClick,
}: {
  groups: MemberPlanGroup[]
  onPlanClick: (plan: MemberPlanItem) => void
}) {
  return (
    <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[340px]">
      {/* 小三角 */}
      <div className="absolute -top-[5px] right-8 h-2.5 w-2.5 rotate-45 border-l border-t border-[#eef0f3] bg-white shadow-[-2px_-2px_4px_rgba(0,0,0,0.02)]" />

      <div className="overflow-hidden rounded-xl border border-[#eef0f3] bg-white py-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        {groups.map((group, gi) => (
          <div key={group.code} className={cn(gi > 0 && 'mt-3 border-t border-[#f0f1f3] pt-3')}>
            <div className="mb-1 flex items-center gap-1.5 px-4">
              <GroupHeaderIcon code={group.code} />
              <span className="text-[13px] font-semibold text-[#1f2329]">
                {group.title}
                <span className="ml-1 font-normal text-[#646a73]">{group.subtitle}</span>
              </span>
            </div>
            <div className="px-2">
              {group.plans.map((plan) => (
                <PlanRow key={plan.id} plan={plan} onClick={() => onPlanClick(plan)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function VipMembershipMenu() {
  const { openMembershipModal } = useMembershipModal()
  const [open, setOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: groups } = useQuery({
    queryKey: ['memberPlans'],
    queryFn: memberApi.getPlans,
    staleTime: 300_000,
  })

  const show = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setOpen(true)
  }, [])

  const hide = useCallback(() => {
    timerRef.current = setTimeout(() => setOpen(false), 120)
  }, [])

  const openModal = (plan?: MemberPlanItem) => {
    const groupCode = plan?.linkUrl?.includes('team') ? 'team' : 'individual'
    let tierCode: string | undefined
    if (plan?.linkUrl) {
      const tab = planLinkToTab(plan.linkUrl)
      if (tab === 'individual') tierCode = plan.linkUrl.includes('ultimate') ? 'pro' : plan.linkUrl.includes('pro') ? 'advanced' : 'basic'
      if (tab === 'team') tierCode = plan.linkUrl.includes('supreme') ? 'supreme' : plan.linkUrl.includes('ultimate') ? 'professional' : 'advanced'
    }
    openMembershipModal({ groupCode, tierCode })
    setOpen(false)
  }

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        onClick={() => openModal()}
        className="flex items-center gap-1.5 rounded-full border border-[#e8d5a8]/60 bg-gradient-to-r from-[#fff9eb] to-[#fff4dc] px-3 py-1.5 text-sm text-[#b8860b] transition hover:shadow-sm"
      >
        <span className="flex h-[18px] items-center gap-0.5 rounded bg-gradient-to-r from-[#f5a623] to-[#e8940c] px-1 text-[9px] font-bold leading-none text-white">
          <Crown className="h-2.5 w-2.5" strokeWidth={2.5} />
          VIP
        </span>
        开通会员
      </button>

      {open && groups && groups.length > 0 && (
        <DropdownPanel groups={groups} onPlanClick={openModal} />
      )}
    </div>
  )
}
