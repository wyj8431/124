import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  buildVariableOffsets,
  getFixedVirtualRange,
  getVariableVirtualRange,
  shouldLoadNextPage,
} from '@/utils/virtualListMath.mjs'

type VirtualListMode = 'fixed' | 'variable'

interface VirtualListProps<T> {
  items: T[]
  getKey: (item: T, index: number) => string | number
  renderItem: (item: T, index: number) => ReactNode
  mode?: VirtualListMode
  itemHeight?: number
  estimatedItemHeight?: number
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

const DEFAULT_FIXED_HEIGHT = 180
const DEFAULT_ESTIMATED_HEIGHT = 180

export function VirtualList<T>({
  items,
  getKey,
  renderItem,
  mode = 'fixed',
  itemHeight = DEFAULT_FIXED_HEIGHT,
  estimatedItemHeight = DEFAULT_ESTIMATED_HEIGHT,
  overscan = 4,
  hasMore = false,
  loading = false,
  loadingMore = false,
  error,
  empty,
  loadingFallback = <div className="virtual-list__message">加载中...</div>,
  onRetry,
  onNearEnd,
  className,
  ariaLabel = '虚拟列表',
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemNodesRef = useRef(new Map<number, HTMLDivElement>())
  const animationFrameRef = useRef<number | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(480)
  const [measuredHeights, setMeasuredHeights] = useState<number[]>([])

  const offsets = useMemo(
    () => buildVariableOffsets(items.length, measuredHeights, estimatedItemHeight),
    [estimatedItemHeight, items.length, measuredHeights],
  )
  const range = useMemo(
    () => mode === 'fixed'
      ? getFixedVirtualRange(items.length, itemHeight, scrollTop, viewportHeight, overscan)
      : getVariableVirtualRange(offsets, scrollTop, viewportHeight, overscan),
    [itemHeight, items.length, mode, offsets, overscan, scrollTop, viewportHeight],
  )
  const totalSize = mode === 'fixed' ? range.totalSize : range.totalSize

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updateViewport = () => setViewportHeight(element.clientHeight || 480)
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
    if (mode === 'fixed' || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver((entries) => {
      setMeasuredHeights((current) => {
        const next = [...current]
        let changed = false
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute('data-virtual-index'))
          const height = Math.ceil(entry.contentRect.height)
          if (!Number.isInteger(index) || height <= 0 || next[index] === height) return
          next[index] = height
          changed = true
        })
        return changed ? next : current
      })
    })

    itemNodesRef.current.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [mode, range.end, range.start])

  useEffect(() => () => {
    if (animationFrameRef.current != null) cancelAnimationFrame(animationFrameRef.current)
  }, [])

  const registerItem = useCallback((index: number, node: HTMLDivElement | null) => {
    if (node) itemNodesRef.current.set(index, node)
    else itemNodesRef.current.delete(index)
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
  }, [hasMore, items.length, loadingMore, onNearEnd, totalSize])

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
      className={['virtual-list', className].filter(Boolean).join(' ')}
      onScroll={handleScroll}
      role="list"
      aria-label={ariaLabel}
      aria-busy={loading || loadingMore}
    >
      <div className="virtual-list__spacer" style={{ height: totalSize }}>
        {items.slice(range.start, range.end).map((item, visibleIndex) => {
          const index = range.start + visibleIndex
          const top = mode === 'fixed' ? index * itemHeight : offsets[index]
          return (
            <div
              key={getKey(item, index)}
              ref={(node) => registerItem(index, node)}
              className="virtual-list__item"
              data-virtual-index={index}
              role="listitem"
              style={{
                top,
                height: mode === 'fixed' ? itemHeight : undefined,
              }}
            >
              {renderItem(item, index)}
            </div>
          )
        })}
      </div>
      {loadingMore ? <div className="virtual-list__message">加载更多...</div> : null}
      {hasMore && !loadingMore ? <div className="virtual-list__message">继续滚动加载更多</div> : null}
    </div>
  )
}

export type { VirtualListProps, VirtualListMode }
