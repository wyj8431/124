import { useAuth } from '@/context/AuthContext'
import { useTeamUpgradeModal } from '@/context/TeamUpgradeModalContext'
import { PlatformLogo } from '@/components/common/PlatformLogo'
import type { TeamIntroPageData } from '@/types/teamIntro'
import { cn } from '@/utils'
import type { ReactNode } from 'react'

const BULLET_DOT =
  'https://www.chuangkit.com/distsaas/img/dot.bb263cc8.svg'

interface Props {
  consultant: TeamIntroPageData['consultant']
}

export function TeamIntroConsultantFloat({ consultant }: Props) {
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const { openTeamUpgradeModal } = useTeamUpgradeModal()

  const handleTrial = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }
    openTeamUpgradeModal()
  }

  return (
    <aside className="team-intro-consultant" aria-label="咨询顾问">
      <img
        src={consultant.avatarUrl}
        alt=""
        className="team-intro-consultant__avatar"
      />
      <div className="team-intro-consultant__panel">
        <p className="team-intro-consultant__title">{consultant.title}</p>
        <div className="team-intro-consultant__qr-wrap">
          <img src={consultant.qrCodeUrl} alt="顾问微信二维码" className="team-intro-consultant__qr" />
          <div className="team-intro-consultant__qr-logo" aria-hidden="true">
            <PlatformLogo className="h-6 w-6" />
          </div>
        </div>
        <p className="team-intro-consultant__subtitle">{consultant.subtitle}</p>
        <div className="team-intro-consultant__line" aria-hidden="true" />
        <button type="button" className="team-intro-consultant__cta" onClick={handleTrial}>
          {consultant.ctaText}
        </button>
      </div>
    </aside>
  )
}

export function TeamIntroHero({
  hero,
  onUpgrade,
}: {
  hero: TeamIntroPageData['hero']
  onUpgrade: () => void
}) {
  return (
    <section className="team-intro-hero">
      <h2 className="team-intro-hero__title">{hero.title}</h2>
      <p className="team-intro-hero__subtitle">{hero.subtitle}</p>
      <button type="button" className="team-intro-hero__cta" onClick={onUpgrade}>
        {hero.ctaText}
      </button>
    </section>
  )
}

export function TeamIntroFeatureSection({
  feature,
  onUpgrade,
  visual,
}: {
  feature: TeamIntroPageData['features'][number]
  onUpgrade: () => void
  visual: ReactNode
}) {
  const textRight = feature.layout === 'text-right'

  return (
    <section className={cn('team-intro-feature', textRight && 'team-intro-feature--reverse')}>
      <div className="team-intro-feature__inner">
        <div className="team-intro-feature__text">
          <h3 className="team-intro-feature__title">{feature.title}</h3>
          <p className="team-intro-feature__subtitle">{feature.subtitle}</p>
          <ul className="team-intro-feature__list">
            {feature.bullets.map((item) => (
              <li key={item}>
                <img src={BULLET_DOT} alt="" className="team-intro-feature__dot" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="team-intro-feature__cta" onClick={onUpgrade}>
            {feature.ctaText}
          </button>
        </div>
        <div className={cn('team-intro-feature__media', textRight ? 'team-intro-feature__media--left' : 'team-intro-feature__media--right')}>
          {visual}
        </div>
      </div>
    </section>
  )
}
