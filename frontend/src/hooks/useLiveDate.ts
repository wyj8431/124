import { useEffect, useState } from 'react'
import { msUntilNextMidnight } from '@/utils/calendar'

/** 每分钟刷新，并在午夜自动更新，保证日历与倒计时实时同步 */
export function useLiveDate() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let midnightTimer: ReturnType<typeof setTimeout> | undefined
    let minuteTimer: ReturnType<typeof setInterval> | undefined

    const sync = () => setNow(new Date())

    const scheduleMidnight = () => {
      midnightTimer = setTimeout(() => {
        sync()
        scheduleMidnight()
      }, msUntilNextMidnight())
    }

    minuteTimer = setInterval(sync, 60_000)
    scheduleMidnight()

    return () => {
      if (midnightTimer) clearTimeout(midnightTimer)
      if (minuteTimer) clearInterval(minuteTimer)
    }
  }, [])

  return now
}
