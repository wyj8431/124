import type { DesignScene, DesignTemplate } from '@/types'

export interface CreateDesignNavItem {
  id: number
  name: string
  code: string
  icon?: string
  parentCode?: string
  matchType?: string
  matchValue?: string
  sortOrder: number
}

export interface CreateDesignSizeTab {
  id: number
  name: string
  code: string
  sortOrder: number
}

export interface CreateDesignIndexData {
  navItems: CreateDesignNavItem[]
  sizeTabs: CreateDesignSizeTab[]
  defaultNavCode: string
  defaultSizeTabCode: string
}

export interface CreateDesignQuery {
  navCode: string
  sizeTabCode: string
  sceneId?: number
  keyword?: string
  page?: number
  pageSize?: number
}

export type { DesignScene, DesignTemplate }
