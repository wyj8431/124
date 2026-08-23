import type { DesignTemplate } from './index'

export interface TemplateCenterNavItem {
  id: number
  name: string
  code: string
  icon?: string
  linkType: string
  linkValue?: string
}

export interface TemplateFilterOption {
  code: string
  name: string
}

export interface TemplateFilterGroup {
  code: string
  name: string
  options: TemplateFilterOption[]
}

export interface TemplateExtraFilterOption {
  code: string
  name: string
  colorHex?: string
}

export interface TemplateExtraFilter {
  code: string
  name: string
  options: TemplateExtraFilterOption[]
}

export interface TemplateSortOption {
  code: string
  name: string
}

export interface TemplateCenterTab {
  code: string
  name: string
}

export interface TemplateCenterIndexData {
  navItems: TemplateCenterNavItem[]
  filterGroups: TemplateFilterGroup[]
  extraFilters: TemplateExtraFilter[]
  sortOptions: TemplateSortOption[]
  tabs: TemplateCenterTab[]
}

export interface TemplateCenterListResult {
  list: DesignTemplate[]
  total: number
}

export interface TemplateCenterQuery {
  tab?: string
  category?: string
  scene?: string
  industry?: string
  sort?: string
  color?: string
  usage?: string
  style?: string
  layout?: string
  price?: string
  type?: string
  keyword?: string
  calendarEventId?: number
  limit?: number
}
