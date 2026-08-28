import { writeFile } from 'node:fs/promises'
import { setDefaultResultOrder } from 'node:dns'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const GATEWAY = 'https://gw.chuangkit.com'
const API_SUFFIX = '_dataType=json&_dataClientType=0&client_type=0'
const OUTPUT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/data/chuangkitHomeOfficial.ts',
)

const HEADERS = {
  referer: 'https://www.chuangkit.com/designtools/designindex?aiMode=template',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36',
}

setDefaultResultOrder('ipv4first')

const SECTION_CONFIG = [
  {
    code: 'xibao',
    title: '喜报',
    subtitle: '喜报模板，一键套用',
    sourceSolutionId: 1185,
    labels: ['全部模板', '销冠喜报', '业绩喜报', '光荣榜', '获奖喜报', '优秀员工表彰', '团队喜报'],
  },
  {
    code: 'zhaopin',
    title: '招聘',
    subtitle: '招聘海报模板，快速发布职位信息',
    sourceSolutionId: 137,
    labels: ['招聘海报', '企业招聘', '校园招聘', '招贤纳士', '人才招聘', '招聘长图', '招聘公告'],
  },
]

function asNumber(value) {
  const parsed = Number.parseFloat(String(value ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function imageUrl(value) {
  const source = String(value ?? '')
  return source.startsWith('//') ? `https:${source}` : source
}

function quote(value) {
  return JSON.stringify(String(value ?? ''))
}

async function fetchJson(url, options) {
  let lastError
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: HEADERS,
        signal: AbortSignal.timeout(30_000),
        ...options,
      })
      if (!response.ok) {
        throw new Error(`Official API request failed (${response.status}): ${url}`)
      }
      const payload = await response.json()
      const body = payload?.body ?? payload
      if (body?.code !== 200) {
        throw new Error(`Official API error: ${body?.msg ?? 'unknown error'}`)
      }
      return body.data
    } catch (error) {
      lastError = error
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
    }
  }
  throw lastError
}

async function fetchWaterfallTabs() {
  const url = `${GATEWAY}/contentcopyright/homepage/config/waterfall/list.do?useType=2&gw=true&${API_SUFFIX}`
  return fetchJson(url)
}

async function fetchSolutionTemplates(sourceSolutionId) {
  const body = new URLSearchParams({
    solutionId: String(sourceSolutionId),
    businessType: '1,2,3,4',
    pageSize: '48',
    pageNo: '1',
    double_sort: '1',
    effect_search: '1',
    accurate_search: '1',
    secondKindId: '',
    sortType: '0',
    priceType: '0',
    format: '0',
    originKeyword: '0',
    tagIdList: '',
  })
  const url = `${GATEWAY}/team/distribution/solution/searchSolutionTemplate.do?${API_SUFFIX}`
  const data = await fetchJson(url, {
    method: 'POST',
    headers: { ...HEADERS, 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
  const seen = new Set()
  return (data?.searchVoList ?? []).filter((item) => {
    const id = Number(item.designTemplateId)
    if (!id || seen.has(id)) return false
    seen.add(id)
    return true
  })
}

function renderTemplate(item, indent = '    ') {
  const image = imageUrl(item.designTemplateImageUrl ?? item.previewUrl)
  const title = item.templateTitle ?? item.kindTitle ?? '未命名模板'
  const tags = Array.isArray(item.keyWords) ? item.keyWords.join(' ') : ''

  return `${indent}officialTemplate(${Number(item.designTemplateId)}, ${quote(title)}, ${quote(image)}, ${asNumber(item.width)}, ${asNumber(item.height)}, ${asNumber(item.designKindId)}, ${quote(tags)}, ${asNumber(item.useTimes)}),`
}

function render(data) {
  const { tabs, templatesBySolution, generatedAt } = data
  const lines = [
    "import type { DesignTemplate, EditorCollection, HomeSection, HomeSectionCard } from '@/types'",
    '',
    'export interface OfficialHomeMasonryTab {',
    '  code: string',
    '  name: string',
    '  sourceSolutionId: number',
    '  templates: DesignTemplate[]',
    '}',
    '',
    'const officialTemplate = (',
    '  id: number,',
    '  title: string,',
    '  coverUrl: string,',
    '  width: number,',
    '  height: number,',
    '  sceneId: number,',
    '  tags: string,',
    '  useCount: number,',
    '): DesignTemplate => ({',
    '  id,',
    '  title,',
    '  coverUrl,',
    '  previewUrl: coverUrl,',
    '  sceneId,',
    '  categoryId: 0,',
    '  width,',
    '  height,',
    '  tags,',
    '  useCount,',
    '  isFree: 1,',
    '  isHot: 0,',
    '  isRecommend: 1,',
    '})',
    '',
    `// Generated from official Chuangkit homepage APIs on ${generatedAt}.`,
    'export const OFFICIAL_HOME_MASONRY_TABS: OfficialHomeMasonryTab[] = [',
  ]

  for (const [index, tab] of tabs.entries()) {
    const code = index === 0 ? 'recommend' : `official-${tab.appConfigId}`
    lines.push('  {')
    lines.push(`    code: ${quote(code)},`)
    lines.push(`    name: ${quote(tab.title)},`)
    lines.push(`    sourceSolutionId: ${Number(tab.sourceSolutionId)},`)
    lines.push('    templates: [')
    for (const item of templatesBySolution.get(tab.sourceSolutionId) ?? []) {
      lines.push(renderTemplate(item, '      '))
    }
    lines.push('    ],')
    lines.push('  },')
  }
  lines.push(']')
  lines.push('')
  lines.push('export const OFFICIAL_HOME_RECOMMEND_TEMPLATES = OFFICIAL_HOME_MASONRY_TABS[0]?.templates ?? []')
  lines.push('')
  lines.push('export const OFFICIAL_HOME_EDITOR_COLLECTIONS: EditorCollection[] = OFFICIAL_HOME_MASONRY_TABS')
  lines.push('  .slice(1, 7)')
  lines.push('  .filter((tab) => tab.templates.length > 0)')
  lines.push('  .map((tab, index) => ({')
  lines.push('    id: 970_000 + index,')
  lines.push('    title: tab.name,')
  lines.push("    subtitle: '官网编辑精选',")
  lines.push('    coverUrl: tab.templates[0].coverUrl,')
  lines.push('    coverUrlHover: tab.templates[1]?.coverUrl ?? tab.templates[0].coverUrl,')
  lines.push('    previewUrls: tab.templates.slice(0, 2).map((template) => template.coverUrl),')
  lines.push('    categoryCode: tab.code,')
  lines.push('    templateCount: tab.templates.length,')
  lines.push('  }))')
  lines.push('')
  lines.push('const sectionCards = (templates: DesignTemplate[], labels: string[]): HomeSectionCard[] =>')
  lines.push('  templates.slice(0, 7).map((template, index) => ({')
  lines.push('    id: template.id,')
  lines.push('    label: labels[index] ?? template.title,')
  lines.push('    templateId: template.id,')
  lines.push('    title: template.title,')
  lines.push('    coverUrl: template.coverUrl,')
  lines.push('    width: template.width,')
  lines.push('    height: template.height,')
  lines.push('    isFree: template.isFree,')
  lines.push('  }))')
  lines.push('')
  lines.push('export const OFFICIAL_HOME_SECTIONS: Record<string, HomeSection> = {')
  for (const section of SECTION_CONFIG) {
    lines.push(`  ${section.code}: {`)
    lines.push(`    id: ${Number(section.sourceSolutionId)},`)
    lines.push(`    code: ${quote(section.code)},`)
    lines.push(`    title: ${quote(section.title)},`)
    lines.push(`    subtitle: ${quote(section.subtitle)},`)
    lines.push(`    templates: [],`)
    lines.push(`    cards: sectionCards([`)
    for (const item of templatesBySolution.get(section.sourceSolutionId) ?? []) {
      lines.push(renderTemplate(item, '      '))
    }
    lines.push(`    ], ${JSON.stringify(section.labels)}),`)
    lines.push('  },')
  }
  lines.push('}')
  lines.push('')
  return lines.join('\n')
}

const waterfallTabs = await fetchWaterfallTabs()
const tabs = waterfallTabs
  .filter((tab) => tab.subType === 'solution' && Number(tab.sourceSolutionId))
  .slice(0, 16)

const sourceIds = new Set([
  ...tabs.map((tab) => Number(tab.sourceSolutionId)),
  ...SECTION_CONFIG.map((section) => section.sourceSolutionId),
])
const templateResults = await Promise.all(
  [...sourceIds].map(async (sourceSolutionId) => [sourceSolutionId, await fetchSolutionTemplates(sourceSolutionId)]),
)
const templatesBySolution = new Map(templateResults)

await writeFile(
  OUTPUT,
  render({
    tabs,
    templatesBySolution,
    generatedAt: new Date().toISOString().slice(0, 10),
  }),
  'utf8',
)

for (const tab of tabs) {
  console.log(`${tab.title}: ${(templatesBySolution.get(tab.sourceSolutionId) ?? []).length}`)
}
for (const section of SECTION_CONFIG) {
  console.log(`${section.title}: ${(templatesBySolution.get(section.sourceSolutionId) ?? []).length}`)
}
