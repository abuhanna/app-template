import { beforeEach, describe, expect, it, vi } from 'vitest'

import { usePagination } from '../usePagination'

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ replace: vi.fn() }),
}))

describe('usePagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with default values', () => {
    const { page, pageSize, sortBy, sortDir, totalItems } = usePagination({ syncWithUrl: false })

    expect(page.value).toBe(1)
    expect(pageSize.value).toBe(10)
    expect(sortBy.value).toBe('')
    expect(sortDir.value).toBe('asc')
    expect(totalItems.value).toBe(0)
  })

  it('initializes with custom defaults', () => {
    const { page, pageSize, sortBy, sortDir } = usePagination({
      syncWithUrl: false,
      defaultPage: 2,
      defaultPageSize: 25,
      defaultSortBy: 'name',
      defaultSortDir: 'desc',
    })

    expect(page.value).toBe(2)
    expect(pageSize.value).toBe(25)
    expect(sortBy.value).toBe('name')
    expect(sortDir.value).toBe('desc')
  })

  it('setPage updates page value', () => {
    const { page, setPage, setTotalItems } = usePagination({ syncWithUrl: false })
    setTotalItems(100)

    setPage(3)
    expect(page.value).toBe(3)
  })

  it('setPage clamps to 1 when given value below 1', () => {
    const { page, setPage } = usePagination({ syncWithUrl: false })

    setPage(-1)
    expect(page.value).toBe(1)
  })

  it('setPage clamps to totalPages when exceeding', () => {
    const { page, setPage, setTotalItems } = usePagination({ syncWithUrl: false })
    setTotalItems(30) // 3 pages with pageSize 10

    setPage(10)
    expect(page.value).toBe(3)
  })

  it('setPageSize updates pageSize and resets page to 1', () => {
    const { page, pageSize, setPage, setPageSize, setTotalItems } = usePagination({ syncWithUrl: false })
    setTotalItems(100)
    setPage(5)

    setPageSize(25)

    expect(pageSize.value).toBe(25)
    expect(page.value).toBe(1)
  })

  it('setPageSize warns and uses default for invalid size', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { pageSize, setPageSize } = usePagination({ syncWithUrl: false })

    setPageSize(7) // Not in PAGE_SIZE_OPTIONS [5, 10, 25, 50, 100]

    expect(pageSize.value).toBe(10) // Falls back to default
  })

  it('setSort updates sort and resets page', () => {
    const { sortBy, sortDir, page, setSort, setPage, setTotalItems } = usePagination({ syncWithUrl: false })
    setTotalItems(100)
    setPage(3)

    setSort('email', 'desc')

    expect(sortBy.value).toBe('email')
    expect(sortDir.value).toBe('desc')
    expect(page.value).toBe(1)
  })

  it('setSort toggles direction when same column clicked', () => {
    const { sortDir, setSort } = usePagination({ syncWithUrl: false })

    setSort('name', 'asc')
    expect(sortDir.value).toBe('asc')

    setSort('name') // Same column, no direction specified
    expect(sortDir.value).toBe('desc')

    setSort('name') // Toggle again
    expect(sortDir.value).toBe('asc')
  })

  it('totalPages computes correctly', () => {
    const { totalPages, setTotalItems } = usePagination({ syncWithUrl: false })

    expect(totalPages.value).toBe(0) // No items

    setTotalItems(25)
    expect(totalPages.value).toBe(3) // ceil(25/10) = 3
  })

  it('hasNext and hasPrevious compute correctly', () => {
    const { hasNext, hasPrevious, setPage, setTotalItems } = usePagination({ syncWithUrl: false })

    setTotalItems(30) // 3 pages

    expect(hasPrevious.value).toBe(false) // page 1
    expect(hasNext.value).toBe(true)

    setPage(2)
    expect(hasPrevious.value).toBe(true)
    expect(hasNext.value).toBe(true)

    setPage(3)
    expect(hasPrevious.value).toBe(true)
    expect(hasNext.value).toBe(false)
  })

  it('nextPage and previousPage navigate correctly', () => {
    const { page, nextPage, previousPage, setTotalItems } = usePagination({ syncWithUrl: false })
    setTotalItems(30) // 3 pages

    nextPage()
    expect(page.value).toBe(2)

    nextPage()
    expect(page.value).toBe(3)

    nextPage() // Should not go past last page
    expect(page.value).toBe(3)

    previousPage()
    expect(page.value).toBe(2)
  })

  it('firstPage and lastPage navigate correctly', () => {
    const { page, firstPage, lastPage, setTotalItems } = usePagination({ syncWithUrl: false })
    setTotalItems(50) // 5 pages

    lastPage()
    expect(page.value).toBe(5)

    firstPage()
    expect(page.value).toBe(1)
  })

  it('reset restores all values to defaults', () => {
    const { page, pageSize, sortBy, sortDir, totalItems, setPage, setPageSize, setSort, setTotalItems, reset } = usePagination({
      syncWithUrl: false,
      defaultSortBy: 'id',
    })

    setTotalItems(100)
    setPage(3)
    setPageSize(25)
    setSort('name', 'desc')

    reset()

    expect(page.value).toBe(1)
    expect(pageSize.value).toBe(10)
    expect(sortBy.value).toBe('id')
    expect(sortDir.value).toBe('asc')
    expect(totalItems.value).toBe(0)
  })

  it('paginationParams returns correct object', () => {
    const { paginationParams, setSort } = usePagination({ syncWithUrl: false })

    // Without sortBy set, should not include sort fields
    expect(paginationParams.value).toEqual({ page: 1, pageSize: 10 })

    setSort('name', 'desc')
    expect(paginationParams.value).toEqual({
      page: 1,
      pageSize: 10,
      sortBy: 'name',
      sortOrder: 'desc',
    })
  })

  it('pageSizeOptions returns expected options', () => {
    const { pageSizeOptions } = usePagination({ syncWithUrl: false })

    expect(pageSizeOptions).toEqual([5, 10, 25, 50, 100])
  })
})
