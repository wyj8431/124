export interface MyDesignNavItem {
  id: number
  name: string
  code: string
  icon?: string
  routePath: string
  sortOrder: number
}

export interface MyDesignFolder {
  id: number
  userId: number
  name: string
  sortOrder: number
}

export interface MyDesignOption {
  code: string
  name: string
}

export interface MyDesignStorage {
  usedCount: number
  totalCount: number
  label: string
}

export interface MyDesignIndexData {
  navItems: MyDesignNavItem[]
  typeTabs: MyDesignOption[]
  sortOptions: MyDesignOption[]
  viewModes: MyDesignOption[]
  folders: MyDesignFolder[]
  storage: MyDesignStorage
  defaultView: string
  defaultSort: string
  defaultTypeTab: string
}

export interface MyDesignItem {
  id: number
  title: string
  coverUrl?: string
  width?: number
  height?: number
  status?: number
  folderId?: number
  sceneId?: number
  templateId?: number
  sceneName?: string
  typeLabel?: string
  createTime?: string
  updateTime?: string
}

export interface MyFavoriteItem {
  id: number
  templateId: number
  title: string
  coverUrl: string
  width?: number
  height?: number
  isFree?: number
  likeTime?: string
}

export type MyDesignViewMode = 'grid' | 'list'
export type MyDesignPageMode = 'list' | 'favorite' | 'recycle'

export interface MyDesignQuery {
  page?: number
  pageSize?: number
  keyword?: string
  sort?: string
  typeTab?: string
  folderId?: number | null
  viewMode?: MyDesignViewMode
}
