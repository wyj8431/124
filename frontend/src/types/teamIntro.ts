export interface TeamIntroPageData {
  hero: {
    title: string
    subtitle: string
    ctaText: string
  }
  teamNavBadge: string
  consultant: {
    title: string
    subtitle: string
    qrCodeUrl: string
    avatarUrl: string
    ctaText: string
  }
  features: TeamIntroFeature[]
}

export interface TeamIntroFeature {
  code: string
  title: string
  subtitle: string
  imageUrl?: string
  layout: 'text-left' | 'text-right'
  ctaText: string
  bullets: string[]
}
