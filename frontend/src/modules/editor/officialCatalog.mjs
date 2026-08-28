const LOCAL_CATALOG_URL = '/create-design/official/catalog.json'
const LOCAL_ASSET_PATH = /^\/create-design\/official\/(?:scenes|templates|resources\/(?:assets|backgrounds|components))\//
const RESOURCE_KINDS = new Set(['asset', 'background', 'component'])

function isPositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function isPositiveId(value) {
  return Number.isInteger(value) && value > 0
}

function normalizeName(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeAssetPath(value) {
  return typeof value === 'string' && LOCAL_ASSET_PATH.test(value) ? value : undefined
}

function normalizeScene(scene) {
  const id = scene?.id
  const name = normalizeName(scene?.name)
  if (!isPositiveId(id) || !name || !isPositiveNumber(scene?.width) || !isPositiveNumber(scene?.height)) return null

  return {
    id,
    name,
    width: scene.width,
    height: scene.height,
    ...(normalizeName(scene.unit) ? { unit: normalizeName(scene.unit) } : {}),
    ...(scene.isPrint === true ? { isPrint: true } : {}),
    ...(normalizeAssetPath(scene.iconPath) ? { iconPath: normalizeAssetPath(scene.iconPath) } : {}),
  }
}

function normalizeTemplate(template) {
  const id = template?.id
  const title = normalizeName(template?.title)
  if (!isPositiveId(id) || !title || !isPositiveNumber(template?.width) || !isPositiveNumber(template?.height)) return null

  return {
    id,
    title,
    width: template.width,
    height: template.height,
    ...(normalizeName(template.sceneName) ? { sceneName: normalizeName(template.sceneName) } : {}),
    ...(normalizeAssetPath(template.coverPath) ? { coverPath: normalizeAssetPath(template.coverPath) } : {}),
  }
}

function normalizeResource(resource) {
  const id = resource?.id
  const title = normalizeName(resource?.title)
  const kind = normalizeName(resource?.kind)
  const categoryId = resource?.categoryId
  const categoryName = normalizeName(resource?.categoryName)
  const sceneId = resource?.sceneId
  const sceneName = normalizeName(resource?.sceneName)
  const previewPath = normalizeAssetPath(resource?.previewPath)

  if (
    !isPositiveId(id) ||
    !title ||
    !RESOURCE_KINDS.has(kind) ||
    !isPositiveId(categoryId) ||
    !categoryName ||
    !isPositiveId(sceneId) ||
    !sceneName ||
    !isPositiveNumber(resource?.width) ||
    !isPositiveNumber(resource?.height) ||
    !previewPath
  ) {
    return null
  }

  return {
    id,
    title,
    kind,
    categoryId,
    categoryName,
    sceneId,
    sceneName,
    width: resource.width,
    height: resource.height,
    previewPath,
  }
}

function normalizeCategory(category) {
  const id = category?.id
  const name = normalizeName(category?.name)
  if (!isPositiveId(id) || !name) return null

  return {
    id,
    name,
    scenes: Array.isArray(category.scenes) ? category.scenes.map(normalizeScene).filter(Boolean) : [],
    templates: Array.isArray(category.templates) ? category.templates.map(normalizeTemplate).filter(Boolean) : [],
  }
}

function emptyCategory() {
  return { id: 0, name: '', scenes: [], templates: [] }
}

export function normalizeOfficialCatalog(catalog) {
  return {
    categories: Array.isArray(catalog?.categories) ? catalog.categories.map(normalizeCategory).filter(Boolean) : [],
    resources: Array.isArray(catalog?.resources) ? catalog.resources.map(normalizeResource).filter(Boolean) : [],
  }
}

export async function loadOfficialCatalog(fetchImpl = fetch) {
  const response = await fetchImpl(LOCAL_CATALOG_URL)
  if (!response.ok) throw new Error('Official editor catalog is unavailable')
  return normalizeOfficialCatalog(await response.json())
}

export function filterOfficialCatalog(catalog, { categoryId, query = '' } = {}) {
  const categories = Array.isArray(catalog?.categories) ? catalog.categories : []
  const category = categories.find((item) => item.id === categoryId) ?? categories[0] ?? emptyCategory()
  const keyword = String(query).trim().toLocaleLowerCase()
  const matches = (item, fields) => !keyword || fields(item).toLocaleLowerCase().includes(keyword)

  return {
    category,
    scenes: category.scenes.filter((scene) => matches(scene, (item) => `${category.name} ${item.name}`)),
    templates: category.templates.filter((template) => matches(template, (item) => `${category.name} ${item.title} ${item.sceneName ?? ''}`)),
  }
}

export function filterOfficialResources(catalog, { kind, sceneId, query = '' } = {}) {
  const keyword = String(query).trim().toLocaleLowerCase()
  const selectedSceneId = Number.isInteger(sceneId) && sceneId > 0 ? sceneId : null
  const resources = Array.isArray(catalog?.resources)
    ? catalog.resources.map(normalizeResource).filter(Boolean)
    : []

  return resources.filter((resource) =>
    (!kind || resource.kind === kind) &&
    (!selectedSceneId || resource.sceneId === selectedSceneId) &&
    (!keyword || `${resource.title} ${resource.categoryName} ${resource.sceneName}`.toLocaleLowerCase().includes(keyword)),
  )
}
