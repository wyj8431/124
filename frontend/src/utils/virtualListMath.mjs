export function getFixedVirtualRange(itemCount, itemHeight, scrollTop, viewportHeight, overscan = 4) {
  const count = Math.max(0, itemCount)
  const height = Math.max(1, itemHeight)
  const top = Math.max(0, scrollTop)
  const viewport = Math.max(0, viewportHeight)
  const safeOverscan = Math.max(0, overscan)
  const start = Math.max(0, Math.floor(top / height) - safeOverscan)
  const end = Math.min(count, Math.ceil((top + viewport) / height) + safeOverscan)

  return {
    start,
    end: Math.max(start, end),
    totalSize: count * height,
    offset: start * height,
  }
}

export function buildVariableOffsets(itemCount, measuredHeights, estimatedHeight = 180) {
  const count = Math.max(0, itemCount)
  const estimate = Math.max(1, estimatedHeight)
  const offsets = [0]

  for (let index = 0; index < count; index += 1) {
    const measured = measuredHeights[index]
    const height = Number.isFinite(measured) && measured > 0 ? measured : estimate
    offsets.push(offsets[index] + height)
  }

  return offsets
}

function findIndexAtOffset(offsets, offset) {
  let low = 0
  let high = Math.max(0, offsets.length - 2)
  const target = Math.max(0, offset)

  while (low <= high) {
    const middle = Math.floor((low + high) / 2)
    if (offsets[middle + 1] <= target) low = middle + 1
    else high = middle - 1
  }

  return Math.min(Math.max(0, low), Math.max(0, offsets.length - 2))
}

export function getVariableVirtualRange(offsets, scrollTop, viewportHeight, overscan = 4) {
  const count = Math.max(0, offsets.length - 1)
  if (!count) return { start: 0, end: 0, totalSize: 0, offset: 0 }

  const top = Math.max(0, scrollTop)
  const viewport = Math.max(0, viewportHeight)
  const safeOverscan = Math.max(0, overscan)
  const visibleStart = findIndexAtOffset(offsets, top)
  const visibleEnd = findIndexAtOffset(offsets, top + viewport) + 1
  const start = Math.max(0, visibleStart - safeOverscan)
  const end = Math.min(count, visibleEnd + safeOverscan)

  return {
    start,
    end: Math.max(start, end),
    totalSize: offsets[count],
    offset: offsets[start],
  }
}

export function shouldLoadNextPage(scrollTop, clientHeight, scrollHeight, threshold = 240) {
  return scrollHeight - (scrollTop + clientHeight) <= Math.max(0, threshold)
}
