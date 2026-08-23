export function coverFallback(seed: string | number, w = 400, h = 533) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

export function featureCover(_title: string, index: number) {
  const colors = [
    'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
    'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
    'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)',
    'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)',
    'linear-gradient(135deg,#fa709a 0%,#fee140 100%)',
    'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)',
    'linear-gradient(135deg,#ff9a9e 0%,#fecfef 100%)',
    'linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%)',
  ]
  return colors[index % colors.length]
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return `${month}.${day} ${weekdays[d.getDay()]}`
}

export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}
