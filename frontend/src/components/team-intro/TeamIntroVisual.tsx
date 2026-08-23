import type { TeamIntroFeature } from '@/types/teamIntro'

export function TeamIntroVisual({ feature }: { feature: TeamIntroFeature }) {
  if (feature.imageUrl) {
    return (
      <img
        src={feature.imageUrl}
        alt=""
        className="team-intro-visual__image"
        loading="lazy"
      />
    )
  }

  return (
    <div className="team-intro-visual__fallback">
      <span>{feature.title}</span>
    </div>
  )
}
