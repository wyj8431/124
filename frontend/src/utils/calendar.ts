import { Solar } from 'lunar-javascript'
import type { CalendarEvent, CalendarToday } from '@/types'

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function parseEventDate(eventDate: string) {
  const [y, m, d] = eventDate.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function getWeekdayName(date: Date) {
  return WEEKDAYS[date.getDay()]
}

export function formatYearMonth(date: Date) {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function formatEventDateLabel(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

export function getLunarDateLabel(date: Date) {
  const lunar = Solar.fromDate(date).getLunar()
  return `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`
}

export function computeTodayInfo(now = new Date()): CalendarToday {
  return {
    day: now.getDate(),
    yearMonth: formatYearMonth(now),
    weekday: getWeekdayName(now),
    lunarDate: getLunarDateLabel(now),
  }
}

export function computeDaysLeft(eventDate: string, now = new Date()) {
  const today = startOfDay(now).getTime()
  const target = startOfDay(parseEventDate(eventDate)).getTime()
  return Math.round((target - today) / 86_400_000)
}

export function enrichCalendarEvent(event: CalendarEvent, now = new Date()): CalendarEvent {
  const date = parseEventDate(event.eventDate)
  return {
    ...event,
    dateLabel: formatEventDateLabel(date),
    weekday: getWeekdayName(date),
    daysLeft: computeDaysLeft(event.eventDate, now),
  }
}

export function enrichCalendarEvents(events: CalendarEvent[], now = new Date()) {
  return events
    .map((event) => enrichCalendarEvent(event, now))
    .filter((event) => event.daysLeft >= 0)
    .sort((a, b) => {
      const dateDiff = a.eventDate.localeCompare(b.eventDate)
      return dateDiff !== 0 ? dateDiff : a.id - b.id
    })
}

export function msUntilNextMidnight(now = new Date()) {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return next.getTime() - now.getTime()
}
