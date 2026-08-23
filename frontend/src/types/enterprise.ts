export interface EnterpriseNavItem {
  id?: number
  name: string
  code: string
  routePath?: string | null
  badgeText?: string | null
  children?: EnterpriseNavItem[]
}

export interface EnterpriseAccountOverview {
  pageTitle: string
  navItems: EnterpriseNavItem[]
  accountInfo: {
    teamName: string
    teamIdLabel: string
    versionLabel: string
    avatarText: string
    vipCtaText: string
    vipCtaLink: string
    flagshipCtaText: string
    flagshipCtaLink: string
  }
  members: {
    current: number
    max: number
    percent: number
    manageRoute: string
  }
  storage: {
    usedLabel: string
    totalLabel: string
    percent: number
    expandLink: string
    detailRoute: string
  }
  points: {
    balance: number
    buyLink: string
    detailRoute: string
  }
  quickAccess: Array<{
    code: string
    name: string
    description: string
    icon: string
    routePath?: string | null
  }>
  promoCard: {
    title: string
    subtitle: string
    badgeText: string
    ctaText: string
    ctaLink: string
  }
}
