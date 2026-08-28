export function getFixedVirtualRange(
  itemCount: number,
  itemHeight: number,
  scrollTop: number,
  viewportHeight: number,
  overscan?: number,
): { start: number; end: number; totalSize: number; offset: number }

export function buildVariableOffsets(
  itemCount: number,
  measuredHeights: Array<number | undefined>,
  estimatedHeight?: number,
): number[]

export function getVariableVirtualRange(
  offsets: number[],
  scrollTop: number,
  viewportHeight: number,
  overscan?: number,
): { start: number; end: number; totalSize: number; offset: number }

export function shouldLoadNextPage(
  scrollTop: number,
  clientHeight: number,
  scrollHeight: number,
  threshold?: number,
): boolean
