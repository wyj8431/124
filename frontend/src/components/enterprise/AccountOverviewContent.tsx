import { Link } from 'react-router-dom'
import { CircleHelp, Crown, UserRound } from 'lucide-react'
import type { EnterpriseAccountOverview } from '@/types/enterprise'
import { useMembershipModal } from '@/context/MembershipModalContext'
import { useFlagshipUpgradeModal } from '@/context/FlagshipUpgradeModalContext'

interface Props {
  data: EnterpriseAccountOverview
}

export function AccountOverviewContent({ data }: Props) {
  const { openMembershipModal } = useMembershipModal()
  const { openFlagshipUpgradeModal } = useFlagshipUpgradeModal()

  return (
    <div className="enterprise-overview">
      <h1 className="enterprise-overview__title">{data.pageTitle}</h1>

      <div className="enterprise-panel">
        <section className="enterprise-account-block">
          <h2 className="enterprise-account-block__title">账号信息</h2>
          <div className="enterprise-account-block__body">
            <div className="enterprise-account-block__badge">{data.accountInfo.avatarText}</div>
            <div className="enterprise-account-block__info">
              <p>
                <span className="enterprise-account-block__label">团队名称：</span>
                {data.accountInfo.teamName}
              </p>
              <p>
                <span className="enterprise-account-block__label">团队ID：</span>
                {data.accountInfo.teamIdLabel}
              </p>
              <p>
                <span className="enterprise-account-block__label">版本：</span>
                <span className="enterprise-account-block__version">{data.accountInfo.versionLabel}</span>
              </p>
            </div>
            <div className="enterprise-account-block__actions">
              <button
                type="button"
                className="enterprise-account-block__btn enterprise-account-block__btn--vip"
                onClick={() => openMembershipModal()}
              >
                {data.accountInfo.vipCtaText}
              </button>
              <button
                type="button"
                className="enterprise-account-block__btn enterprise-account-block__btn--flagship"
                onClick={() => openFlagshipUpgradeModal()}
              >
                <Crown className="enterprise-account-block__btn-icon" aria-hidden="true" />
                <span>{data.accountInfo.flagshipCtaText}</span>
              </button>
            </div>
          </div>
        </section>

        <section className="enterprise-row">
          <span className="enterprise-row__label">团队成员</span>
          <div className="enterprise-row__main">
            <div className="enterprise-row__progress">
              <span
                className="enterprise-row__progress-fill enterprise-row__progress-fill--green"
                style={{ width: `${Math.max(data.members.percent, 4)}%` }}
              />
            </div>
            <div className="enterprise-row__meta">
              <span className="enterprise-row__count">
                {data.members.current}/{data.members.max}
              </span>
              <span className="enterprise-row__avatar">
                <UserRound className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
          <Link to={data.members.manageRoute} className="enterprise-row__action">
            成员管理
          </Link>
        </section>

        <section className="enterprise-row">
          <span className="enterprise-row__label">储存空间</span>
          <div className="enterprise-row__main">
            <div className="enterprise-row__progress">
              <span
                className="enterprise-row__progress-fill enterprise-row__progress-fill--blue"
                style={{ width: `${Math.max(data.storage.percent, 4)}%` }}
              />
            </div>
            <div className="enterprise-row__meta">
              <span className="enterprise-row__storage">
                {data.storage.usedLabel}/{data.storage.totalLabel}
              </span>
              <Link to={data.storage.expandLink} className="enterprise-row__link">
                扩展 &gt;
              </Link>
            </div>
          </div>
          <Link to={data.storage.detailRoute} className="enterprise-row__action">
            查看明细
          </Link>
        </section>

        <section className="enterprise-row">
          <span className="enterprise-row__label enterprise-row__label--with-icon">
            团队积分
            <CircleHelp className="h-3.5 w-3.5 text-[#c9cdd4]" />
          </span>
          <div className="enterprise-row__main enterprise-row__main--points">
            <span className="enterprise-row__points-label">当前剩余：</span>
            <Link to={data.points.buyLink} className="enterprise-row__link">
              购买积分 &gt;
            </Link>
          </div>
          <Link to={data.points.detailRoute} className="enterprise-row__action">
            查看明细
          </Link>
        </section>
      </div>
    </div>
  )
}
