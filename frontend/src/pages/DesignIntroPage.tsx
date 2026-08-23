import { useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTeamUpgradeModal } from '@/context/TeamUpgradeModalContext'
import { useTeamIntro } from '@/hooks/useTeamIntro'
import {
  TeamIntroConsultantFloat,
  TeamIntroHero,
  TeamIntroFeatureSection,
} from '@/components/team-intro/TeamIntroSections'
import { TeamIntroVisual } from '@/components/team-intro/TeamIntroVisual'

const HERO_BANNER =
  'https://eyuankupub-cdn-oss.chuangkit.com/teach/www/banner-bg.png'

export function DesignIntroPage() {
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const { openTeamUpgradeModal } = useTeamUpgradeModal()
  const { data, isLoading, error } = useTeamIntro()

  const handleUpgrade = useCallback(() => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }
    openTeamUpgradeModal()
  }, [isLoggedIn, setShowLoginModal, openTeamUpgradeModal])

  if (isLoading) {
    return (
      <div className="team-intro-page team-intro-page--loading">
        <div className="team-intro-page__skeleton" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="team-intro-page team-intro-page--error">
        <p>页面加载失败，请稍后重试</p>
      </div>
    )
  }

  return (
    <div className="team-intro-page">
      <div
        className="team-intro-page__main"
        style={{ backgroundImage: `url("${HERO_BANNER}")` }}
      >
        <TeamIntroHero hero={data.hero} onUpgrade={handleUpgrade} />

        <div className="team-intro-page__features">
          {data.features.map((feature) => (
            <TeamIntroFeatureSection
              key={feature.code}
              feature={feature}
              onUpgrade={handleUpgrade}
              visual={<TeamIntroVisual feature={feature} />}
            />
          ))}
        </div>
      </div>

      <TeamIntroConsultantFloat consultant={data.consultant} />
    </div>
  )
}
