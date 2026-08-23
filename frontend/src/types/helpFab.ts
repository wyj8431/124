export interface HelpFabMenuItem {
  id: number
  name: string
  code: string
  icon: string
  linkUrl: string | null
  linkTarget: '_blank' | '_self' | 'action'
}

export interface HelpFabCustomerService {
  title: string
  subtitle: string
  qrCodeUrl: string
  avatarUrl: string
}

export interface HelpFabIndexData {
  items: HelpFabMenuItem[]
  customerService: HelpFabCustomerService | null
}
