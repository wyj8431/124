import type { UserDesign } from './index'

export interface DesignShareLink {
  id: number
  designId: number
  token: string
  mode: 'readonly' | 'editable' | string
  expireTime?: string | null
  revoked: boolean
}

export interface DesignShareAccess extends UserDesign {
  designId: number
  mode: 'readonly' | 'editable' | string
  token: string
}
