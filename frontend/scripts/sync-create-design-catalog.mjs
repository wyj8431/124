import { access, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const GATEWAY = 'https://gw.chuangkit.com'
const DESIGN_INDEX_URL = 'https://www.chuangkit.com/designtools/designindex'
const OUTPUT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../public/create-design/official',
)

const REQUEST_HEADERS = {
  referer: DESIGN_INDEX_URL,
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36',
}

function toNumber(value) {
  const parsed = Number.parseFloat(String(value ?? ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function dimensionUnit(value) {
  const match = String(value ?? '').trim().match(/(px|mm|cm)$/i)
  return match?.[1].toLowerCase()
}

function dimensionMetadata(width, height, isPrint) {
  const unit = dimensionUnit(width) ?? dimensionUnit(height)
  return {
    ...(unit && unit !== 'px' ? { unit } : {}),
    ...(isPrint ? { isPrint: true } : {}),
  }
}

const CONTENT_TYPE_EXTENSIONS = new Map([
  ['image/avif', '.avif'],
  ['image/bmp', '.bmp'],
  ['image/gif', '.gif'],
  ['image/jpeg', '.jpg'],
  ['image/jpg', '.jpg'],
  ['image/png', '.png'],
  ['image/svg+xml', '.svg'],
  ['image/tiff', '.tif'],
  ['image/webp', '.webp'],
  ['image/x-icon', '.ico'],
  ['image/vnd.microsoft.icon', '.ico'],
])

const KNOWN_EXTENSIONS = new Set([...CONTENT_TYPE_EXTENSIONS.values(), '.jpeg', '.tiff'])

export const OFFICIAL_RESOURCE_SCENES = Object.freeze([
  { categoryId: 12, sceneId: 460, kind: 'background' },
  { categoryId: 12, sceneId: 458, kind: 'background' },
  { categoryId: 12, sceneId: 517, kind: 'component' },
  { categoryId: 12, sceneId: 459, kind: 'asset' },
  { categoryId: 12, sceneId: 574, kind: 'asset' },
  { categoryId: 12, sceneId: 233, kind: 'asset' },
  { categoryId: 12, sceneId: 669, kind: 'asset' },
  { categoryId: 12, sceneId: 232, kind: 'asset' },
  { categoryId: 12, sceneId: 235, kind: 'asset' },
])

function normalizeAssetExtension(value) {
  if (typeof value !== 'string') return null
  const extension = value.trim().toLowerCase()
  if (!extension) return null
  const normalized = extension.startsWith('.') ? extension : `.${extension}`
  return KNOWN_EXTENSIONS.has(normalized) ? normalized : null
}

function headerValue(response, name) {
  const headers = response?.headers
  if (!headers) return ''
  if (typeof headers.get === 'function') return headers.get(name) ?? ''

  const headerName = name.toLowerCase()
  const matchingKey = Object.keys(headers).find((key) => key.toLowerCase() === headerName)
  return matchingKey ? String(headers[matchingKey] ?? '') : ''
}

function extensionFromContentType(contentType) {
  const mediaType = String(contentType ?? '').split(';', 1)[0].trim().toLowerCase()
  return CONTENT_TYPE_EXTENSIONS.get(mediaType) ?? null
}

function extensionFromMagicBytes(bytes) {
  if (!bytes) return null
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)

  if (
    data.length >= 8 &&
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47 &&
    data[4] === 0x0d &&
    data[5] === 0x0a &&
    data[6] === 0x1a &&
    data[7] === 0x0a
  ) {
    return '.png'
  }
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return '.jpg'
  }
  if (data.length >= 6) {
    const signature = new TextDecoder().decode(data.subarray(0, 6))
    if (signature === 'GIF87a' || signature === 'GIF89a') return '.gif'
    if (signature === 'RIFF' && data.length >= 12 && new TextDecoder().decode(data.subarray(8, 12)) === 'WEBP') {
      return '.webp'
    }
  }
  if (data.length >= 2 && data[0] === 0x42 && data[1] === 0x4d) return '.bmp'
  if (data.length >= 4 && data[0] === 0x00 && data[1] === 0x00 && data[2] === 0x01 && data[3] === 0x00) {
    return '.ico'
  }
  if (data.length >= 12 && new TextDecoder().decode(data.subarray(4, 12)) === 'ftypavif') return '.avif'

  const text = new TextDecoder().decode(data.subarray(0, Math.min(data.length, 4096)))
  if (/<svg(?:\s|>)/i.test(text)) return '.svg'
  return null
}

function extensionFromUrl(url) {
  if (!url) return null
  try {
    const pathname = new URL(absoluteOfficialUrl(url)).pathname
    return normalizeAssetExtension(path.extname(pathname))
  } catch {
    return null
  }
}

export function detectAssetExtension(response, bytes, sourceUrl) {
  return (
    extensionFromMagicBytes(bytes) ??
    extensionFromContentType(headerValue(response, 'content-type')) ??
    extensionFromUrl(sourceUrl)
  )
}

function assetPath(basePath, extension) {
  const normalizedExtension = normalizeAssetExtension(extension)
  if (!normalizedExtension) return basePath

  const existingExtension = normalizeAssetExtension(path.extname(basePath))
  if (!existingExtension) return `${basePath}${normalizedExtension}`
  if (existingExtension === normalizedExtension) return basePath
  return `${basePath.slice(0, -existingExtension.length)}${normalizedExtension}`
}

async function existingAsset(destination, fileExistsImpl) {
  const destinationExtension = normalizeAssetExtension(path.extname(destination))
  if (destinationExtension && (await fileExistsImpl(destination))) {
    return { destination, extension: destinationExtension }
  }

  for (const extension of KNOWN_EXTENSIONS) {
    const candidate = assetPath(destination, extension)
    if (await fileExistsImpl(candidate)) return { destination: candidate, extension }
  }

  return null
}

function extensionForKey(extensionMap, key) {
  if (!extensionMap) return null
  const value = extensionMap instanceof Map ? extensionMap.get(key) : extensionMap[key]
  return normalizeAssetExtension(value) ?? extensionFromContentType(value)
}

function localScenePath(categoryId, sceneId, extension) {
  return assetPath(`/create-design/official/scenes/${categoryId}-${sceneId}`, extension)
}

function localTemplatePath(categoryId, templateId, extension) {
  return assetPath(`/create-design/official/templates/${categoryId}-${templateId}`, extension)
}

function resourceFolder(kind) {
  return `${kind}s`
}

function localResourcePath(kind, sceneId, templateId, extension) {
  return assetPath(
    `/create-design/official/resources/${resourceFolder(kind)}/${sceneId}-${templateId}`,
    extension,
  )
}

function absoluteOfficialUrl(url) {
  return url?.startsWith('//') ? `https:${url}` : url
}

export function sceneAssetUrls(scene) {
  const urls = [scene.iconUrl]
  if (scene.tempCenterFirstKindId && scene.tempCenterFirstKindId !== scene.firstKindId) {
    const version = new URL(absoluteOfficialUrl(scene.iconUrl)).search
    urls.push(
      `https://pub-cdn-oss.chuangkit.com/content_distribution/template/secondKind/icon/new/7_${scene.tempCenterFirstKindId}_${scene.kindId}${version}`,
    )
  }
  urls.push(scene.imgUrl)

  return [...new Set(urls.filter(Boolean).map(absoluteOfficialUrl))]
}

export function buildOfficialResources(kinds, templatesByScene, options = {}) {
  return OFFICIAL_RESOURCE_SCENES.flatMap(({ categoryId, sceneId, kind }) => {
    const category = kinds.find((item) => Number(item.firstKindId) === categoryId)
    const scene = category?.designKind?.find((item) => Number(item.kindId) === sceneId)

    return (templatesByScene.get(`${categoryId}-${sceneId}`) ?? []).map((template) => ({
      id: Number(template.designTemplateId),
      title: String(template.templateTitle),
      kind,
      categoryId,
      categoryName: String(category?.firstKindName ?? ''),
      sceneId,
      sceneName: String(scene?.kindTitle ?? template.kindTitle ?? ''),
      width: toNumber(template.width),
      height: toNumber(template.height),
      previewPath: localResourcePath(
        kind,
        sceneId,
        template.designTemplateId,
        extensionForKey(options.resourceExtensions, `${kind}-${sceneId}-${template.designTemplateId}`),
      ),
    }))
  }).filter((resource) =>
    resource.id > 0 &&
    resource.title &&
    resource.categoryName &&
    resource.sceneName &&
    resource.width > 0 &&
    resource.height > 0,
  )
}

export function buildCatalog(kinds, templatesByCategory, options = {}) {
  const sceneExtensions = options?.sceneExtensions
  const templateExtensions = options?.templateExtensions
  const resourceTemplates = options?.resourceTemplates ?? new Map()
  const resourceExtensions = options?.resourceExtensions

  return {
    version: 2,
    source: DESIGN_INDEX_URL,
    categories: kinds.map((kind) => {
      const categoryId = Number(kind.firstKindId)

      return {
        id: categoryId,
        name: String(kind.firstKindName),
        scenes: (kind.designKind ?? []).map((scene) => ({
          id: Number(scene.kindId),
          name: String(scene.kindTitle),
          width: toNumber(scene.kindWidth),
          height: toNumber(scene.kindHeight),
          ...dimensionMetadata(scene.kindWidth, scene.kindHeight, scene.isPrint),
          iconPath: localScenePath(
            categoryId,
            scene.kindId,
            extensionForKey(sceneExtensions, `${categoryId}-${scene.kindId}`),
          ),
        })),
        templates: (templatesByCategory.get(categoryId) ?? []).map((template) => ({
          id: Number(template.designTemplateId),
          title: String(template.templateTitle),
          width: toNumber(template.width),
          height: toNumber(template.height),
          ...dimensionMetadata(template.width, template.height),
          sceneId: Number(template.designKindId),
          sceneName: String(template.kindTitle ?? ''),
          coverPath: localTemplatePath(
            categoryId,
            template.designTemplateId,
            extensionForKey(templateExtensions, `${categoryId}-${template.designTemplateId}`),
          ),
        })),
      }
    }),
    resources: buildOfficialResources(kinds, resourceTemplates, { resourceExtensions }),
  }
}

export function removeUnavailableSceneIcons(catalog, unavailableSceneKeys) {
  return {
    ...catalog,
    categories: catalog.categories.map((category) => ({
      ...category,
      scenes: category.scenes.map((scene) => {
        if (!unavailableSceneKeys.has(`${category.id}-${scene.id}`)) return scene
        const { iconPath: _iconPath, ...sceneWithoutIcon } = scene
        return sceneWithoutIcon
      }),
    })),
  }
}

export function removeUnavailableTemplateCovers(catalog, unavailableTemplateKeys) {
  return {
    ...catalog,
    categories: catalog.categories.map((category) => ({
      ...category,
      templates: category.templates.filter(
        (template) => !unavailableTemplateKeys.has(`${category.id}-${template.id}`),
      ),
    })),
  }
}

export function removeUnavailableResources(catalog, unavailableResourceKeys) {
  return {
    ...catalog,
    resources: (catalog.resources ?? []).filter(
      (resource) => !unavailableResourceKeys.has(`${resource.kind}-${resource.sceneId}-${resource.id}`),
    ),
  }
}

export async function writeCatalogAtomically(
  destination,
  catalog,
  {
    writeFileImpl = writeFile,
    renameImpl = rename,
  } = {},
) {
  const temporaryDestination = `${destination}.next`
  await writeFileImpl(temporaryDestination, `${JSON.stringify(catalog, null, 2)}\n`)
  await renameImpl(temporaryDestination, destination)
}

export async function fileExists(destination, accessImpl = access) {
  try {
    await accessImpl(destination)
    return true
  } catch {
    return false
  }
}

export async function migrateLegacyAsset(
  destination,
  {
    fileExistsImpl = fileExists,
    readFileImpl = readFile,
    renameImpl = rename,
  } = {},
) {
  if (normalizeAssetExtension(path.extname(destination))) return null
  if (!(await fileExistsImpl(destination))) return null

  let bytes
  try {
    bytes = new Uint8Array(await readFileImpl(destination))
  } catch {
    return null
  }
  const extension = detectAssetExtension(null, bytes, destination)
  if (!extension) return null

  const finalDestination = assetPath(destination, extension)
  if (await fileExistsImpl(finalDestination)) return { destination: finalDestination, extension }
  await renameImpl(destination, finalDestination)
  return { destination: finalDestination, extension }
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: REQUEST_HEADERS })
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`)
  }

  const payload = await response.json()
  if (payload?.body?.code !== 200) {
    throw new Error(`Official API error: ${payload?.body?.msg ?? 'Unknown error'}`)
  }

  return payload.body.data
}

async function fetchKinds() {
  return fetchJson(
    `${GATEWAY}/contentcopyright/page/module/create/design/kinds?nottrans=true`,
  )
}

export function templateSearchUrl(categoryId, sceneId) {
  const params = new URLSearchParams({
    double_sort: '1',
    effect_search: '1',
    accurate_search: '1',
    business_type: '1,2,3,4',
    first_kind_id: String(categoryId),
    sort_type: '0',
    price_type: '0',
    page_no: '1',
    originKeyword: '0',
    isJudge: '0',
    userId: '0',
    page_size: '24',
    renderType: 'csr',
  })
  if (sceneId) params.set('second_kind_id', String(sceneId))
  return `${GATEWAY}/team/distribution/template/centerQuery.do?${params}`
}

async function fetchTemplates(categoryId, sceneId) {
  const data = await fetchJson(templateSearchUrl(categoryId, sceneId))
  return data.searchVoList ?? []
}

export async function downloadAsset(
  urls,
  destination,
  {
    fetchImpl = fetch,
    writeFileImpl = writeFile,
    fileExistsImpl = fileExists,
    delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  } = {},
) {
  const existing = await existingAsset(destination, fileExistsImpl)
  if (existing) return existing

  const candidates = Array.isArray(urls) ? urls : [urls]
  const failures = []

  for (const url of candidates) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetchImpl(absoluteOfficialUrl(url), { headers: REQUEST_HEADERS })
        if (!response.ok) {
          failures.push(`${response.status}: ${url}`)
          if (response.status >= 500 && attempt < 2) {
            await delay(250 * (attempt + 1))
            continue
          }
          break
        }

        const bytes = new Uint8Array(await response.arrayBuffer())
        const extension = detectAssetExtension(response, bytes, url)
        const finalDestination = assetPath(destination, extension)
        await writeFileImpl(finalDestination, bytes)
        return { destination: finalDestination, extension }
      } catch (error) {
        failures.push(`${error.message}: ${url}`)
        if (attempt < 2) {
          await delay(250 * (attempt + 1))
          continue
        }
      }
    }
  }

  throw new Error(`Asset download failed: ${failures.join(', ')}`)
}

async function runLimited(tasks, limit = 2) {
  const pending = [...tasks]
  const workers = Array.from({ length: Math.min(limit, pending.length) }, async () => {
    while (pending.length) {
      const task = pending.shift()
      await task()
    }
  })
  await Promise.all(workers)
}

export async function syncCreateDesignCatalog() {
  const kinds = await fetchKinds()
  const templateEntries = await Promise.all(
    kinds.map(async (kind) => [
      Number(kind.firstKindId),
      await fetchTemplates(kind.firstKindId),
    ]),
  )
  const templatesByCategory = new Map(templateEntries)
  const resourceTemplateEntries = await Promise.all(
    OFFICIAL_RESOURCE_SCENES.map(async ({ categoryId, sceneId }) => [
      `${categoryId}-${sceneId}`,
      await fetchTemplates(categoryId, sceneId),
    ]),
  )
  const resourceTemplates = new Map(resourceTemplateEntries)

  const scenesDir = path.join(OUTPUT_ROOT, 'scenes')
  const templatesDir = path.join(OUTPUT_ROOT, 'templates')
  const resourceDirectories = [...new Set(
    OFFICIAL_RESOURCE_SCENES.map((resource) => path.join(OUTPUT_ROOT, 'resources', resourceFolder(resource.kind))),
  )]
  await Promise.all([
    mkdir(scenesDir, { recursive: true }),
    mkdir(templatesDir, { recursive: true }),
    ...resourceDirectories.map((directory) => mkdir(directory, { recursive: true })),
  ])

  const unavailableSceneIcons = new Set()
  const unavailableTemplateCovers = new Set()
  const unavailableResourcePreviews = new Set()
  const sceneExtensions = new Map()
  const templateExtensions = new Map()
  const resourceExtensions = new Map()
  const resources = buildOfficialResources(kinds, resourceTemplates)
  const downloads = [
    ...kinds.flatMap((kind) =>
      (kind.designKind ?? []).map((scene) => () => {
        const key = `${kind.firstKindId}-${scene.kindId}`
        const destination = path.join(scenesDir, `${kind.firstKindId}-${scene.kindId}`)
        return migrateLegacyAsset(destination)
          .catch(() => null)
          .then(() => downloadAsset(sceneAssetUrls(scene), destination))
          .then((result) => {
            if (result?.extension) sceneExtensions.set(key, result.extension)
          })
          .catch(() => {
            unavailableSceneIcons.add(`${kind.firstKindId}-${scene.kindId}`)
          })
      }),
    ),
    ...templateEntries.flatMap(([categoryId, templates]) =>
      templates.map((template) => () => {
        const key = `${categoryId}-${template.designTemplateId}`
        const destination = path.join(templatesDir, `${categoryId}-${template.designTemplateId}`)
        return migrateLegacyAsset(destination)
          .catch(() => null)
          .then(() => downloadAsset(template.designTemplateImageUrl, destination))
          .then((result) => {
            if (result?.extension) templateExtensions.set(key, result.extension)
          })
          .catch(() => {
            unavailableTemplateCovers.add(`${categoryId}-${template.designTemplateId}`)
          })
      }),
    ),
    ...resources.map((resource) => () => {
      const key = `${resource.kind}-${resource.sceneId}-${resource.id}`
      const template = resourceTemplates.get(`${resource.categoryId}-${resource.sceneId}`)?.find(
        (item) => Number(item.designTemplateId) === resource.id,
      )
      const destination = path.join(
        OUTPUT_ROOT,
        'resources',
        resourceFolder(resource.kind),
        `${resource.sceneId}-${resource.id}`,
      )
      return migrateLegacyAsset(destination)
        .catch(() => null)
        .then(() => downloadAsset(template?.designTemplateImageUrl, destination))
        .then((result) => {
          if (result?.extension) resourceExtensions.set(key, result.extension)
        })
        .catch(() => {
          unavailableResourcePreviews.add(key)
        })
    }),
  ]

  await runLimited(downloads)
  const catalog = buildCatalog(kinds, templatesByCategory, {
    sceneExtensions,
    templateExtensions,
    resourceTemplates,
    resourceExtensions,
  })
  const finalCatalog = removeUnavailableResources(
    removeUnavailableTemplateCovers(
      removeUnavailableSceneIcons(catalog, unavailableSceneIcons),
      unavailableTemplateCovers,
    ),
    unavailableResourcePreviews,
  )
  await writeCatalogAtomically(path.join(OUTPUT_ROOT, 'catalog.json'), finalCatalog)

  return {
    categories: finalCatalog.categories.length,
    scenes: finalCatalog.categories.reduce((count, category) => count + category.scenes.length, 0),
    templates: finalCatalog.categories.reduce((count, category) => count + category.templates.length, 0),
    resources: finalCatalog.resources.length,
    unavailableSceneIcons: unavailableSceneIcons.size,
    unavailableTemplateCovers: unavailableTemplateCovers.size,
    unavailableResourcePreviews: unavailableResourcePreviews.size,
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  syncCreateDesignCatalog()
    .then((result) => {
      console.log(
        `Synced ${result.categories} categories, ${result.scenes} scenes, ${result.templates} templates, and ${result.resources} resources. ${result.unavailableSceneIcons} unavailable scene icons, ${result.unavailableTemplateCovers} unavailable template covers, and ${result.unavailableResourcePreviews} unavailable resource previews were omitted.`,
      )
    })
    .catch((error) => {
      console.error(error)
      process.exitCode = 1
    })
}
