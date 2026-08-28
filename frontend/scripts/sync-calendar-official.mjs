import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const GATEWAY = 'https://gw.chuangkit.com'
const ENDPOINT = GATEWAY + '/hatchery/calendar/getFesTemplateList.do?_dataType=json&_clientType=0'
const OUTPUT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/data/chuangkitCalendarOfficial.ts',
)

const EVENTS = [
  { id: 56, name: '中元节', keyword: '中元节', eventDate: '2026-08-27', categoryCode: 'traditional', coverUrl: '/calendar/events/zhongyuan.webp' },
  { id: 97, name: '九月你好', keyword: '九月你好', eventDate: '2026-09-01', categoryCode: 'marketing', coverUrl: '/calendar/events/jiuyue.webp' },
  { id: 105, name: '开学季', keyword: '开学季', eventDate: '2026-09-01', categoryCode: 'marketing', coverUrl: '/calendar/events/kaixue.webp' },
  { id: 11, name: '白露', keyword: '白露', eventDate: '2026-09-07', categoryCode: 'solar_terms', coverUrl: '/calendar/events/bailu.webp' },
  { id: 76, name: '教师节', keyword: '教师节', eventDate: '2026-09-10', categoryCode: 'modern', coverUrl: '/calendar/events/jiaoshi.webp' },
  { id: 115, name: '勿忘九一八', keyword: '勿忘九一八', eventDate: '2026-09-18', categoryCode: 'memorial', coverUrl: '/calendar/events/jiuyiba.webp' },
  { id: 12, name: '秋分', keyword: '秋分', eventDate: '2026-09-23', categoryCode: 'solar_terms', coverUrl: '/calendar/events/qiufen.webp' },
  { id: 57, name: '中秋节', keyword: '中秋节', eventDate: '2026-09-25', categoryCode: 'traditional', coverUrl: 'https://pub-oss.chuangkit.com/ad_position/435feaf7315a4898b60cd4c7a43da25f' },
  { id: 78, name: '国庆节', keyword: '国庆节', eventDate: '2026-10-01', categoryCode: 'memorial', coverUrl: 'https://pub-oss.chuangkit.com/ad_position/46feabde66654cd1bbb94f73df638361' },
  { id: 109, name: '双11', keyword: '双11', eventDate: '2026-11-11', categoryCode: 'ecommerce', coverUrl: 'https://pub-oss.chuangkit.com/ad_position/8c996a468b2b4342bb46c20fdfdff6b3' },
]

const REQUEST_HEADERS = {
  referer: 'https://www.chuangkit.com/templatecenter/calendarCenter?newCalendar=1',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36',
}

function asNumber(value) {
  const parsed = Number.parseFloat(String(value ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function quote(value) {
  return JSON.stringify(String(value ?? ''))
}

async function fetchPage(keyword, pageNum) {
  const form = new URLSearchParams({
    pageNum: String(pageNum),
    pageSize: '100',
    keywords: keyword,
    userId: '',
    gw: 'true',
    sceneId: '',
    showKind: '1',
    business_type: '1,2,3,4',
    _dataClientType: '0',
    client_type: '0',
  })
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { ...REQUEST_HEADERS, 'content-type': 'application/x-www-form-urlencoded' },
    body: form,
  })
  if (!response.ok) throw new Error('Official API request failed: ' + response.status)
  const payload = await response.json()
  if (payload?.body?.code !== 200) throw new Error('Official API error: ' + (payload?.body?.msg ?? 'unknown'))
  return payload.body.data
}

async function fetchEvent(event) {
  const firstPage = await fetchPage(event.keyword, 1)
  const pages = [firstPage]
  // The official page loads the masonry in pages. Two pages reproduce its visible scroll.
  if (firstPage.hasNext) pages.push(await fetchPage(event.keyword, 2))
  const items = pages.flatMap((page) => page.searchVoList ?? [])
  const seen = new Set()
  const templates = items.filter((item) => {
    const id = Number(item.designTemplateId)
    if (!id || seen.has(id)) return false
    seen.add(id)
    return true
  })
  return { event, totalCount: Number(firstPage.totalCount ?? templates.length), templates }
}

function renderTemplate(item) {
  const image = item.designTemplateImageUrl ?? item.previewUrl ?? ''
  const width = asNumber(item.width)
  const height = asNumber(item.height)
  const tags = Array.isArray(item.keyWords) ? item.keyWords.join(' ') : ''
  return '      cdnTemplate('
    + Number(item.designTemplateId) + ', '
    + quote(item.templateTitle) + ', '
    + quote(image) + ', '
    + width + ', '
    + height + ', '
    + (Number(item.designKindId) || 0) + ', '
    + quote(tags) + ', '
    + (Number(item.useTimes) || 0)
    + '),'
}

function render(data) {
  const lines = [
    "import type { CalendarEvent, DesignTemplate } from '@/types'",
    '',
    'export interface OfficialCalendarFestival extends CalendarEvent {',
    '  aliases: string[]',
    '  totalCount: number',
    '  templates: DesignTemplate[]',
    '}',
    '',
    'const cdnTemplate = (',
    '  id: number,',
    '  title: string,',
    '  path: string,',
    '  width: number,',
    '  height: number,',
    '  sceneId: number,',
    '  tags: string,',
    '  useCount: number,',
    '): DesignTemplate => ({',
    '  id,',
    '  title,',
    "  coverUrl: path.startsWith('//') ? 'https:' + path : path,",
    "  previewUrl: path.startsWith('//') ? 'https:' + path : path,",
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
    '// Generated from the official calendar endpoint on 2026-08-25.',
    'export const OFFICIAL_CALENDAR_FESTIVALS: OfficialCalendarFestival[] = [',
  ]

  for (const { event, totalCount, templates } of data) {
    const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][
      new Date(event.eventDate + 'T00:00:00').getDay()
    ]
    lines.push('  {')
    lines.push('    id: ' + event.id + ',')
    lines.push('    name: ' + quote(event.name) + ',')
    lines.push('    aliases: ' + (event.name === '双11' ? '["双十一"]' : '[]') + ',')
    lines.push('    eventDate: ' + quote(event.eventDate) + ',')
    lines.push('    weekday: ' + quote(weekday) + ',')
    lines.push('    daysLeft: 0,')
    lines.push('    categoryCode: ' + quote(event.categoryCode) + ',')
    lines.push('    coverUrl: ' + quote(event.coverUrl) + ',')
    lines.push('    totalCount: ' + totalCount + ',')
    lines.push('    templates: [')
    for (const template of templates) lines.push(renderTemplate(template))
    lines.push('    ],')
    lines.push('  },')
  }

  lines.push(
    ']',
    '',
    'const officialFestivalByName = new Map(',
    '  OFFICIAL_CALENDAR_FESTIVALS.flatMap((festival) => [',
    '    [festival.name, festival],',
    '    ...festival.aliases.map((alias) => [alias, festival] as const),',
    '  ]),',
    ')',
    '',
    'export function getOfficialCalendarFestival(name: string) {',
    '  return officialFestivalByName.get(name)',
    '}',
    '',
  )
  return lines.join('\n')
}

const data = await Promise.all(EVENTS.map(fetchEvent))
await writeFile(OUTPUT, render(data), 'utf8')
for (const item of data) console.log(item.event.name + ': ' + item.templates.length + '/' + item.totalCount)
