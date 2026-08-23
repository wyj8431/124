import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronRight,
  Copy,
  Crown,
  FileText,
  Hexagon,
  KeyRound,
  MessageSquare,
  ShieldCheck,
  Ticket,
} from 'lucide-react'
import { authApi } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { useMembershipModal } from '@/context/MembershipModalContext'
import type { AccountPanelData } from '@/types'
import { cn } from '@/utils'

function coverFallback(id: number) {
  return `https://picsum.photos/seed/user-${id}/64/64`
}

const menuIcons: Record<string, typeof Hexagon> = {
  team: Hexagon,
  order: FileText,
  auth: ShieldCheck,
  message: MessageSquare,
  coupon: Ticket,
}

function AccountPanel({
  data,
  onLogout,
  onOpenMembership,
  onNavigate,
}: {
  data: AccountPanelData
  onLogout: () => void
  onOpenMembership: () => void
  onNavigate: () => void
}) {
  const copyUserId = async () => {
    try {
      await navigator.clipboard.writeText(data.user.userIdLabel)
    } catch {
      // ignore
    }
  }

  return (
    <div className="account-panel">
      <div className="account-panel__arrow" />

      <div className="account-panel__body">
        <div className="account-panel__user">
          <img
            src={data.user.avatar || coverFallback(data.user.id)}
            alt=""
            className="account-panel__avatar"
          />
          <div className="account-panel__user-main">
            <div className="account-panel__user-row">
              <span className="account-panel__name">{data.user.displayName}</span>
              <span className="account-panel__role">{data.user.roleLabel}</span>
            </div>
            <div className="account-panel__user-id">
              <span>用户ID: {data.user.userIdLabel}</span>
              <button type="button" className="account-panel__copy" onClick={copyUserId} aria-label="复制用户ID">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <button type="button" className="account-panel__access-key">
            <KeyRound className="h-3.5 w-3.5" />
            Access Key
          </button>
        </div>

        <div className="account-panel__member">
          <div className="account-panel__member-left">
            <span className="account-panel__member-badge">
              <Crown className="h-3 w-3" />
              {data.member.levelName}
            </span>
            <p className="account-panel__member-title">{data.member.title}</p>
            <p className="account-panel__member-subtitle">{data.member.subtitle}</p>
          </div>
          <button
            type="button"
            className="account-panel__member-cta"
            onClick={onOpenMembership}
          >
            {data.member.ctaText}
          </button>
        </div>

        <div className="account-panel__stats">
          <div className="account-panel__stat">
            <div className="account-panel__stat-head">
              <span>存储空间</span>
              <button type="button" className="account-panel__stat-link">
                扩容 <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="account-panel__progress">
              <span
                className="account-panel__progress-fill"
                style={{ width: `${data.storage.percent}%` }}
              />
            </div>
            <p className="account-panel__stat-value">
              {data.storage.usedLabel} / {data.storage.totalLabel}
            </p>
          </div>

          <div className="account-panel__stat">
            <div className="account-panel__stat-head">
              <span>AI积分</span>
              <button type="button" className="account-panel__stat-link">
                加购 <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <p className="account-panel__credits">{data.aiCredits.balance}</p>
            <button type="button" className="account-panel__credits-tip">
              {data.aiCredits.tip}
            </button>
          </div>
        </div>

        <div className="account-panel__switcher">
          <div className="account-panel__switcher-left">
            <img
              src={data.user.avatar || coverFallback(data.user.id)}
              alt=""
              className="account-panel__switcher-avatar"
            />
            <div>
              <p className="account-panel__switcher-name">{data.accountSwitcher.displayName}</p>
              <p className="account-panel__switcher-version">{data.accountSwitcher.versionLabel}</p>
            </div>
          </div>
          <div className="account-panel__switcher-right">
            <span className="account-panel__trial-badge">{data.accountSwitcher.trialBadge}</span>
            <button type="button" className="account-panel__create-team">
              {data.accountSwitcher.createTeamText}
            </button>
          </div>
        </div>

        <nav className="account-panel__menu">
          {data.menuItems.map((item) => {
            const Icon = menuIcons[item.icon] ?? Hexagon
            const content = (
              <>
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </>
            )
            return item.routePath ? (
              <Link
                key={item.code}
                to={item.routePath}
                className="account-panel__menu-item"
                onClick={onNavigate}
              >
                {content}
              </Link>
            ) : (
              <button key={item.code} type="button" className="account-panel__menu-item">
                {content}
              </button>
            )
          })}
        </nav>

        <div className="account-panel__footer">
          <button type="button" className="account-panel__logout" onClick={onLogout}>
            退出登录
          </button>
        </div>
      </div>
    </div>
  )
}

interface Props {
  variant?: 'full' | 'avatar'
  className?: string
}

export function UserAccountMenu({ variant = 'full', className }: Props) {
  const { isLoggedIn, user, logout, setShowLoginModal } = useAuth()
  const { openMembershipModal } = useMembershipModal()
  const [open, setOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: panel } = useQuery({
    queryKey: ['accountPanel'],
    queryFn: authApi.accountPanel,
    enabled: isLoggedIn,
    staleTime: 60_000,
  })

  const show = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setOpen(true)
  }, [])

  const hide = useCallback(() => {
    timerRef.current = setTimeout(() => setOpen(false), 120)
  }, [])

  if (!isLoggedIn || !user) {
    return (
      <button
        type="button"
        onClick={() => setShowLoginModal(true)}
        className={cn(
          'rounded-lg bg-[#0773fc] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#0668e3]',
          className,
        )}
      >
        登录/注册
      </button>
    )
  }

  const displayName = panel?.user.displayName ?? user.nickname ?? user.username

  return (
    <div
      className={cn('user-account-menu', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <button type="button" className="user-account-menu__trigger">
        <img
          src={user.avatar || coverFallback(user.id)}
          alt=""
          className="user-account-menu__avatar"
        />
        {variant === 'full' ? (
          <span className="user-account-menu__name">{displayName}</span>
        ) : null}
      </button>

      {open && panel ? (
        <AccountPanel
          data={panel}
          onLogout={logout}
          onNavigate={() => setOpen(false)}
          onOpenMembership={() => {
            openMembershipModal()
            setOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}
