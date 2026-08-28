export interface OfficialScene {
  id: number
  name: string
  width: number
  height: number
  unit?: string
  isPrint?: boolean
  iconPath?: string
}

export interface OfficialTemplate {
  id: number
  title: string
  width: number
  height: number
  sceneName?: string
  coverPath?: string
}

export type OfficialResourceKind = 'asset' | 'background' | 'component'

export interface OfficialResource {
  id: number
  title: string
  kind: OfficialResourceKind
  categoryId: number
  categoryName: string
  sceneId: number
  sceneName: string
  width: number
  height: number
  previewPath: string
}

export interface OfficialCategory {
  id: number
  name: string
  scenes: OfficialScene[]
  templates: OfficialTemplate[]
}

export interface OfficialCatalog {
  categories: OfficialCategory[]
  resources: OfficialResource[]
}

export interface OfficialCatalogSelection {
  category: OfficialCategory
  scenes: OfficialScene[]
  templates: OfficialTemplate[]
}

export function normalizeOfficialCatalog(catalog: unknown): OfficialCatalog
export function loadOfficialCatalog(fetchImpl?: typeof fetch): Promise<OfficialCatalog>
export function filterOfficialCatalog(catalog: OfficialCatalog | undefined, filters?: { categoryId?: number | null; query?: string }): OfficialCatalogSelection
export function filterOfficialResources(catalog: OfficialCatalog | undefined, filters?: { kind?: OfficialResourceKind; sceneId?: number; query?: string }): OfficialResource[]
