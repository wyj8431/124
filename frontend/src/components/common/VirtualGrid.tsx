import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { buildVariableOffsets, getVariableVirtualRange, shouldLoadNextPage } from '@/utils/virtualListMath.mjs'

interface VirtualGridProps<T> {
  items: T[]
  getKey: (item: T, index: number) => string | number
  renderItem: (item: T, index: number) => ReactNode
  minColumnWidth?: number
  columnGap?: number
  rowGap?: number
  estimatedRowHeight?: number
  overscan?: number
  hasMore?: boolean
  loading?: boolean
  loadingMore?: boolean
  error?: string
  empty?: ReactNode
  loadingFallback?: ReactNode
  onRetry?: () => void
  onNearEnd?: () => void
  className?: string
  ariaLabel?: string
}

export function VirtualGrid<T>({
  items,
  getKey,
  renderItem,
  minColumnWidth = 180,
  columnGap = 16,
  rowGap = 20,
  estimatedRowHeight = 280,
  overscan = 2,
  hasMore = false,
  loading = false,
  loadingMore = false,
  error,
  empty,
  loadingFallback = <div className="virtual-list__message">加载中...</div>,
  onRetry,
  onNearEnd,
  className,
  ariaLabel = '虚拟网格列表',
}: VirtualGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rowNodesRef = useRef(new Map<number, HTMLDivElement>())
  const animationFrameRef = useRef<number | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewport, setViewport] = useState({ width: 960, height: 480 })
  const [rowHeights, setRowHeights] = useState<number[]>([])

  const columnCount = Math.max(1, Math.floor((viewport.width + columnGap) / (minColumnWidth + columnGap)))
  const rowCount = Math.ceil(items.length / columnCount)
  const measuredRowHeights = useMemo(
    () => rowHeights.map((height, index) => index < rowCount - 1 ? height + rowGap : height),
    [rowGap, rowCount, rowHeights],
  )
  const offsets = useMemo(
    () => buildVariableOffsets(rowCount, measuredRowHeights, estimatedRowHeight + rowGap),
    [estimatedRowHeight, measuredRowHeights, rowCount, rowGap],
  )
  const range = useMemo(
    () => getVariableVirtualRange(offsets, scrollTop, viewport.height, overscan),
    [offsets, overscan, scrollTop, viewport.height],
  )

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updateViewport = () => setViewport({
      width: element.clientWidth || 960,
      height: element.clientHeight || 480,
    })
    updateViewport()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateViewport)
      return () => window.removeEventListener('resize', updateViewport)
    }

    const observer = new ResizeObserver(updateViewport)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver((entries) => {
      setRowHeights((current) => {
        const next = [...current]
        let changed = false
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute('data-virtual-row'))
          const height = Math.ceil(entry.contentRect.height)
          if (!Number.isInteger(index) || height <= 0 || next[index] === height) return
          next[index] = height
          changed = true
        })
        return changed ? next : current
      })
    })

    rowNodesRef.current.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [range.end, range.start, columnCount])

  useEffect(() => () => {
    if (animationFrameRef.current != null) cancelAnimationFrame(animationFrameRef.current)
  }, [])

  const registerRow = useCallback((index: number, node: HTMLDivElement | null) => {
    if (node) rowNodesRef.current.set(index, node)
    else rowNodesRef.current.delete(index)
  }, [])

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget
    const nextScrollTop = element.scrollTop
    if (animationFrameRef.current != null) cancelAnimationFrame(animationFrameRef.current)
    animationFrameRef.current = requestAnimationFrame(() => {
      setScrollTop(nextScrollTop)
      if (
        hasMore
        && !loadingMore
        && onNearEnd
        && shouldLoadNextPage(nextScrollTop, element.clientHeight, element.scrollHeight)
      ) {
        onNearEnd()
      }
    })
  }, [hasMore, loadingMore, onNearEnd])

  useEffect(() => {
    const element = containerRef.current
    if (!element || !hasMore || loadingMore || !onNearEnd) return
    if (shouldLoadNextPage(element.scrollTop, element.clientHeight, element.scrollHeight)) onNearEnd()
  }, [hasMore, items.length, loadingMore, onNearEnd, range.totalSize])

  if (loading && !items.length) return <>{loadingFallback}</>
  if (error && !items.length) {
    return (
      <div className="virtual-list__message virtual-list__message--error" role="alert">
        <span>{error}</span>
        {onRetry ? <button type="button" onClick={onRetry}>重试</button> : null}
      </div>
    )
  }
  if (!items.length) return <>{empty}</>

  return (
    <div
      ref={containerRef}
      className={['virtual-grid', className].filter(Boolean).join(' ')}
      onScroll={handleScroll}
      role="list"
      aria-label={ariaLabel}
      aria-busy={loading || loadingMore}
    >
      <div className="virtual-grid__spacer" style={{ height: range.totalSize }}>
        {Array.from({ length: range.end - range.start }, (_, visibleRow) => {
          const rowIndex = range.start + visibleRow
          const rowItems = items.slice(rowIndex * columnCount, (rowIndex + 1) * columnCount)
          return (
            <div
              key={rowItems[0] ? getKey(rowItems[0], rowIndex * columnCount) : rowIndex}
              ref={(node) => registerRow(rowIndex, node)}
              className="virtual-grid__row"
              data-virtual-row={rowIndex}
              style={{
                top: offsets[rowIndex],
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                columnGap,
              }}
            >
              {rowItems.map((item, itemOffset) => {
                const index = rowIndex * columnCount + itemOffset
                return <div key={getKey(item, index)}>{renderItem(item, index)}</div>
              })}
            </div>
          )
        })}
      </div>
      {loadingMore ? <div className="virtual-list__message">加载更多...</div> : null}
      {hasMore && !loadingMore ? <div className="virtual-list__message">继续滚动加载更多</div> : null}
    </div>
  )
}

export type { VirtualGridProps }
