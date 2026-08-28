import type { CalendarEvent, DesignTemplate } from '@/types'
import { computeDaysLeft } from '@/utils/calendar'
import {
  OFFICIAL_CALENDAR_FESTIVALS,
  getOfficialCalendarFestival,
} from '@/data/chuangkitCalendarOfficial'

interface FestivalTemplateSeed {
  id: number
  title: string
  image: string
}

interface FestivalSeed {
  id: number
  name: string
  eventDate: string
  weekday: string
  categoryCode: string
  coverUrl: string
  templates: FestivalTemplateSeed[]
}

const template = (id: number, title: string, image: string): DesignTemplate => ({
  id,
  title,
  coverUrl: image,
  previewUrl: image,
  sceneId: 447,
  categoryId: 0,
  width: 1242,
  height: 2208,
  useCount: 0,
  isFree: 1,
  isHot: 0,
  isRecommend: 0,
})

const FESTIVALS: FestivalSeed[] = [
  {
    id: 56,
    name: '中元节',
    eventDate: '2026-08-27',
    weekday: '星期四',
    categoryCode: 'traditional',
    coverUrl: '/calendar/events/zhongyuan.webp',
    templates: [
      { id: 526817, title: '手绘风中元节主题海报', image: '/calendar/templates/zhongyuan/1.webp' },
      { id: 573007, title: '中元节节日问候祝福宣传手机海报', image: '/calendar/templates/zhongyuan/2.webp' },
      { id: 572948, title: '中国风中元节主题海报', image: '/calendar/templates/zhongyuan/3.webp' },
      { id: 572655, title: '棕色手绘风中元节主题海报', image: '/calendar/templates/zhongyuan/4.webp' },
      { id: 572647, title: '中元节问候祝福宣传手机海报', image: '/calendar/templates/zhongyuan/5.webp' },
      { id: 572630, title: '中元节主题海报', image: '/calendar/templates/zhongyuan/6.webp' },
      { id: 572092, title: '中元节问候祝福宣传手机海报', image: '/calendar/templates/zhongyuan/7.webp' },
      { id: 572052, title: '中元节主题海报', image: '/calendar/templates/zhongyuan/8.webp' },
    ],
  },
  {
    id: 97,
    name: '九月你好',
    eventDate: '2026-09-01',
    weekday: '星期二',
    categoryCode: 'marketing',
    coverUrl: '/calendar/events/jiuyue.webp',
    templates: [
      { id: 492299, title: '手绘风九月你好教育宣传日签', image: '/calendar/templates/jiuyue/1.webp' },
      { id: 583731, title: '简约风9月你好问候祝福日签海报', image: '/calendar/templates/jiuyue/2.webp' },
      { id: 583570, title: '简约文艺9月你好日签', image: '/calendar/templates/jiuyue/3.webp' },
      { id: 583077, title: '9月你好简约风日签', image: '/calendar/templates/jiuyue/4.webp' },
      { id: 583035, title: '九月你好情绪氛围日签海报', image: '/calendar/templates/jiuyue/5.webp' },
      { id: 583027, title: '黄绿色清新简约9月你好日签海报', image: '/calendar/templates/jiuyue/6.webp' },
      { id: 583019, title: '蓝绿色清新风9月你好日签海报', image: '/calendar/templates/jiuyue/7.webp' },
    ],
  },
  {
    id: 105,
    name: '开学季',
    eventDate: '2026-09-01',
    weekday: '星期二',
    categoryCode: 'marketing',
    coverUrl: '/calendar/events/kaixue.webp',
    templates: [
      { id: 583048, title: '兴趣班开学季招生宣传海报', image: '/calendar/templates/kaixue/2.webp' },
      { id: 583050, title: '可爱手绘开学全科培优教培招生海报', image: '/calendar/templates/kaixue/3.webp' },
      { id: 582997, title: '黄绿色拟真实文件夹开学通知主题海报', image: '/calendar/templates/kaixue/4.webp' },
      { id: 583633, title: '手绘卡通开学季促销海报', image: '/calendar/templates/kaixue/5.webp' },
      { id: 583646, title: '手绘风开学季主题海报', image: '/calendar/templates/kaixue/6.webp' },
      { id: 583575, title: '立体卡通社团招新海报', image: '/calendar/templates/kaixue/7.webp' },
      { id: 553817, title: '开学季趣味文案主题海报', image: '/calendar/templates/kaixue/8.webp' },
    ],
  },
  {
    id: 11,
    name: '白露',
    eventDate: '2026-09-07',
    weekday: '星期一',
    categoryCode: 'solar_terms',
    coverUrl: '/calendar/events/bailu.webp',
    templates: [
      { id: 525774, title: '白露二十四节气图文风手机海报', image: '/calendar/templates/bailu/1.webp' },
      { id: 488895, title: '白露理财借势白金风海报', image: '/calendar/templates/bailu/2.webp' },
      { id: 297040, title: '白鹭二十四节气合成风海报', image: '/calendar/templates/bailu/3.webp' },
      { id: 554146, title: '白露节气主题海报', image: '/calendar/templates/bailu/4.webp' },
      { id: 554141, title: '白露主题海报', image: '/calendar/templates/bailu/5.webp' },
      { id: 527424, title: '白露节气合成风海报', image: '/calendar/templates/bailu/6.webp' },
      { id: 556706, title: '白露节气动态海报', image: '/calendar/templates/bailu/7.webp' },
      { id: 556705, title: '白露节气动态海报', image: '/calendar/templates/bailu/8.webp' },
    ],
  },
  {
    id: 76,
    name: '教师节',
    eventDate: '2026-09-10',
    weekday: '星期四',
    categoryCode: 'modern',
    coverUrl: '/calendar/events/jiaoshi.webp',
    templates: [
      { id: 583457, title: '感恩教师节拼贴风祝福海报节日海报', image: '/calendar/templates/jiaoshi/1.webp' },
      { id: 583217, title: '手绘风教师节活动促销海报', image: '/calendar/templates/jiaoshi/2.webp' },
      { id: 583195, title: '白色拼贴风教师节祝福海报', image: '/calendar/templates/jiaoshi/3.webp' },
      { id: 583176, title: '3D 卡通教师节文具教辅促销活动海报', image: '/calendar/templates/jiaoshi/4.webp' },
      { id: 583174, title: '3D 黏土风教师节鲜花促销活动海报', image: '/calendar/templates/jiaoshi/5.webp' },
      { id: 583157, title: '黄色信封教师节活动宣传海报', image: '/calendar/templates/jiaoshi/6.webp' },
      { id: 583149, title: '教师节活动促销海报', image: '/calendar/templates/jiaoshi/7.webp' },
      { id: 583134, title: '教师节活动海报', image: '/calendar/templates/jiaoshi/8.webp' },
    ],
  },
  {
    id: 115,
    name: '勿忘九一八',
    eventDate: '2026-09-18',
    weekday: '星期五',
    categoryCode: 'memorial',
    coverUrl: '/calendar/events/jiuyiba.webp',
    templates: [
      { id: 556209, title: '918事变主题海报', image: '/calendar/templates/jiuyiba/1.webp' },
      { id: 556207, title: '九一八事变纪念日主题海报', image: '/calendar/templates/jiuyiba/2.webp' },
      { id: 556155, title: '手绘纪念九一八事变宣传海报', image: '/calendar/templates/jiuyiba/3.webp' },
      { id: 555544, title: '纪念九一八事变创意海报', image: '/calendar/templates/jiuyiba/4.webp' },
      { id: 555328, title: '九一八事变纪念日主题海报', image: '/calendar/templates/jiuyiba/5.webp' },
      { id: 555207, title: '九一八事变纪念日主题海报', image: '/calendar/templates/jiuyiba/6.webp' },
      { id: 555206, title: '九一八事变纪念日主题海报', image: '/calendar/templates/jiuyiba/7.webp' },
      { id: 555205, title: '918事变主题渐变质感风海报', image: '/calendar/templates/jiuyiba/8.webp' },
    ],
  },
  {
    id: 12,
    name: '秋分',
    eventDate: '2026-09-23',
    weekday: '星期三',
    categoryCode: 'solar_terms',
    coverUrl: '/calendar/events/qiufen.webp',
    templates: [
      { id: 489184, title: '中国风秋分养生宣传手机海报', image: '/calendar/templates/qiufen/1.webp' },
      { id: 583597, title: '秋分节气橙色扁平插画祝福海报', image: '/calendar/templates/qiufen/2.webp' },
      { id: 583572, title: '秋分节气秋日氛围创意文字祝福海报', image: '/calendar/templates/qiufen/3.webp' },
      { id: 557346, title: '秋分二十四节气手绘风手机海报', image: '/calendar/templates/qiufen/4.webp' },
      { id: 557110, title: '手绘风秋分主题海报', image: '/calendar/templates/qiufen/5.webp' },
      { id: 556262, title: '原创手绘秋分主题海报', image: '/calendar/templates/qiufen/6.webp' },
      { id: 556254, title: '原创手绘秋分主题海报', image: '/calendar/templates/qiufen/7.webp' },
      { id: 556145, title: '秋分二十四节气主题海报', image: '/calendar/templates/qiufen/8.webp' },
    ],
  },
]

const seedByName = new Map(FESTIVALS.map((festival) => [festival.name, festival]))

export function getChuangkitFestival(name: string) {
  return seedByName.get(name) ?? getOfficialCalendarFestival(name)
}

export function mergeChuangkitCalendarEvents(
  events: CalendarEvent[],
  categoryCodes?: string[],
): CalendarEvent[] {
  const includedFestivals = new Set<string>()
  const seenEventKeys = new Set<string>()
  const mergedEvents: CalendarEvent[] = []

  for (const event of events) {
    const festival = getChuangkitFestival(event.name)
    const eventKey = festival?.name ?? `${event.name}:${event.eventDate}`
    if (seenEventKeys.has(eventKey)) continue
    seenEventKeys.add(eventKey)

    if (!festival) {
      mergedEvents.push(event)
      continue
    }

    includedFestivals.add(festival.name)
    mergedEvents.push({
      ...event,
      name: festival.name,
      eventDate: festival.eventDate,
      weekday: festival.weekday,
      categoryCode: festival.categoryCode ?? event.categoryCode,
      coverUrl: festival.coverUrl,
    })
  }

  const missingEvents = [...FESTIVALS, ...OFFICIAL_CALENDAR_FESTIVALS]
    .filter(
      (festival) =>
        !includedFestivals.has(festival.name) &&
        (!categoryCodes?.length || categoryCodes.includes(festival.categoryCode ?? '')),
    )
    .map((festival) => ({
      id: 10_000 + festival.id,
      name: festival.name,
      eventDate: festival.eventDate,
      weekday: festival.weekday,
      daysLeft: computeDaysLeft(festival.eventDate),
      categoryCode: festival.categoryCode,
      coverUrl: festival.coverUrl,
    }))

  const allEvents = [...mergedEvents, ...missingEvents]
  const uniqueEvents = allEvents.filter((event, index, list) => {
    const eventKey = getChuangkitFestival(event.name)?.name ?? event.name.trim()
    return list.findIndex((candidate) => {
      const candidateKey = getChuangkitFestival(candidate.name)?.name ?? candidate.name.trim()
      return candidateKey === eventKey
    }) === index
  })

  return uniqueEvents
    .map((event) => ({ ...event, daysLeft: computeDaysLeft(event.eventDate) }))
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate) || a.id - b.id)
}

export function getChuangkitTemplates(name: string): DesignTemplate[] {
  const officialFestival = getOfficialCalendarFestival(name)
  if (officialFestival) return officialFestival.templates

  return (seedByName.get(name)?.templates ?? []).map((item) => template(item.id, item.title, item.image))
}
