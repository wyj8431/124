export interface TeamUpgradeModalData {
  formTitle: string
  leftPanel: {
    title: string
    tags: string[]
    collage: string[]
    features: Array<{ title: string; subtitle: string }>
  }
  sizeLabel: string
  sizeOptions: Array<{ code: string; label: string }>
  ctaText: string
  ctaBadge: string
  personalLabel: string
  teamLabel: string
  redirectPath: string
  userPreview?: {
    maskedAccount: string
    avatar?: string
    teamName: string
    teamAvatarText: string
  }
}

export interface TeamUpgradeSubmitResult {
  teamName: string
  redirectPath: string
  message: string
}
