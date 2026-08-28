import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  buildVariableOffsets,
  getFixedVirtualRange,
  getVariableVirtualRange,
  shouldLoadNextPage,
} from '../src/utils/virtualListMath.mjs'

test('fixed virtual range keeps a stable spacer and renders only visible rows', () => {
  assert.deepEqual(getFixedVirtualRange(1000, 50, 500, 200, 2), {
    start: 8,
    end: 16,
    totalSize: 50_000,
    offset: 400,
  })
})

test('variable virtual range uses measured heights and an estimated height for unknown rows', () => {
  const offsets = buildVariableOffsets(5, [80, 120, undefined, 200, undefined], 100)

  assert.deepEqual(offsets, [0, 80, 200, 300, 500, 600])
  assert.deepEqual(getVariableVirtualRange(offsets, 210, 400, 0), {
    start: 2,
    end: 5,
    totalSize: 600,
    offset: 200,
  })
})

test('next page loading is requested only inside the scroll threshold', () => {
  assert.equal(shouldLoadNextPage(670, 300, 1_100, 120), false)
  assert.equal(shouldLoadNextPage(680, 300, 1_100, 120), true)
})

test('my design views use fixed and dynamic virtual rendering with infinite loading hooks', async () => {
  const [designGrid, favoriteGrid, virtualList, virtualGrid] = await Promise.all([
    readFile(new URL('../src/components/my-design/MyDesignGrid.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/my-design/MyFavoriteGrid.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/common/VirtualList.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/common/VirtualGrid.tsx', import.meta.url), 'utf8'),
  ])

  assert.match(designGrid, /<VirtualList[\s\S]*mode="fixed"/)
  assert.match(designGrid, /<VirtualGrid/)
  assert.match(favoriteGrid, /<VirtualGrid/)
  assert.match(virtualList, /ResizeObserver/)
  assert.match(virtualList, /requestAnimationFrame/)
  assert.match(virtualGrid, /getVariableVirtualRange/)
  assert.match(virtualGrid, /onNearEnd\(\)/)
})
