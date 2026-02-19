import { useState, useCallback, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  type SortDirection,
  type PaginationParams,
  type PaginationMeta,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_DIR,
  PAGE_SIZE_OPTIONS,
} from '@/types/pagination'

export interface UsePaginationOptions {
  /** Default page number (default: 1) */
  defaultPage?: number
  /** Default page size (default: 10) */
  defaultPageSize?: number
  /** Default sort field */
  defaultSortBy?: string
  /** Default sort direction (default: 'asc') */
  defaultSortDir?: SortDirection
  /** Sync pagination state with URL query params (default: true) */
  syncWithUrl?: boolean
  /** Query param prefix for URL sync (useful when multiple paginated lists on same page) */
  urlPrefix?: string
}

export interface UsePaginationReturn {
  // State
  page: number
  pageSize: number
  sortBy: string
  sortDir: SortDirection
  totalItems: number

  // Computed
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  paginationParams: PaginationParams
  paginationMeta: PaginationMeta

  // Control functions
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  setSort: (sortBy: string, sortDir?: SortDirection) => void
  setTotalItems: (total: number) => void
  reset: () => void
  nextPage: () => void
  previousPage: () => void
  firstPage: () => void
  lastPage: () => void

  // Constants
  pageSizeOptions: number[]
}

/**
 * usePagination hook
 *
 * Manages pagination state with optional URL query parameter synchronization
 * for bookmarkable pages.
 *
 * @param options - Configuration options
 * @returns Pagination state and control functions
 *
 * @example
 * ```tsx
 * const {
 *   page,
 *   pageSize,
 *   sortBy,
 *   sortDir,
 *   totalItems,
 *   totalPages,
 *   hasNext,
 *   hasPrevious,
 *   setPage,
 *   setPageSize,
 *   setSort,
 *   setTotalItems,
 *   reset,
 *   paginationParams
 * } = usePagination({
 *   defaultPageSize: 25,
 *   defaultSortBy: 'createdAt',
 *   defaultSortDir: 'desc'
 * })
 *
 * // Fetch data with pagination params
 * useEffect(() => {
 *   const fetchData = async () => {
 *     const result = await api.getUsers(paginationParams)
 *     setUsers(result.items)
 *     setTotalItems(result.pagination.totalItems)
 *   }
 *   fetchData()
 * }, [page, pageSize, sortBy, sortDir])
 * ```
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    defaultPage = DEFAULT_PAGE,
    defaultPageSize = DEFAULT_PAGE_SIZE,
    defaultSortBy = '',
    defaultSortDir = DEFAULT_SORT_DIR,
    syncWithUrl = true,
    urlPrefix = '',
  } = options

  const [searchParams, setSearchParams] = useSearchParams()

  // Helper to get prefixed param name
  const getParamName = useCallback(
    (name: string): string => {
      return urlPrefix ? `${urlPrefix}_${name}` : name
    },
    [urlPrefix]
  )

  // Helper to parse query param as number
  const parseQueryNumber = useCallback(
    (paramName: string, defaultValue: number): number => {
      const value = searchParams.get(getParamName(paramName))
      if (!value) return defaultValue
      const parsed = parseInt(value, 10)
      return isNaN(parsed) ? defaultValue : parsed
    },
    [searchParams, getParamName]
  )

  // Helper to parse query param as string
  const parseQueryString = useCallback(
    (paramName: string, defaultValue: string): string => {
      return searchParams.get(getParamName(paramName)) || defaultValue
    },
    [searchParams, getParamName]
  )

  // Helper to parse sort direction
  const parseQuerySortDir = useCallback(
    (paramName: string, defaultValue: SortDirection): SortDirection => {
      const value = searchParams.get(getParamName(paramName))
      if (value === 'asc' || value === 'desc') {
        return value
      }
      return defaultValue
    },
    [searchParams, getParamName]
  )

  // Initialize state from URL if syncWithUrl is enabled
  const getInitialPage = (): number => {
    if (syncWithUrl) {
      return parseQueryNumber('page', defaultPage)
    }
    return defaultPage
  }

  const getInitialPageSize = (): number => {
    if (syncWithUrl) {
      const size = parseQueryNumber('pageSize', defaultPageSize)
      // Validate page size is in allowed options
      return PAGE_SIZE_OPTIONS.includes(size) ? size : defaultPageSize
    }
    return defaultPageSize
  }

  const getInitialSortBy = (): string => {
    if (syncWithUrl) {
      return parseQueryString('sortBy', defaultSortBy)
    }
    return defaultSortBy
  }

  const getInitialSortDir = (): SortDirection => {
    if (syncWithUrl) {
      return parseQuerySortDir('sortDir', defaultSortDir)
    }
    return defaultSortDir
  }

  // State
  const [page, setPageState] = useState(getInitialPage)
  const [pageSize, setPageSizeState] = useState(getInitialPageSize)
  const [sortBy, setSortByState] = useState(getInitialSortBy)
  const [sortDir, setSortDirState] = useState<SortDirection>(getInitialSortDir)
  const [totalItems, setTotalItemsState] = useState(0)

  // Computed values
  const totalPages = useMemo(() => {
    if (totalItems === 0) return 0
    return Math.ceil(totalItems / pageSize)
  }, [totalItems, pageSize])

  const hasNext = useMemo(() => page < totalPages, [page, totalPages])
  const hasPrevious = useMemo(() => page > 1, [page])

  const paginationParams = useMemo<PaginationParams>(
    () => ({
      page,
      pageSize,
      ...(sortBy && { sortBy }),
      ...(sortBy && { sortDir }),
    }),
    [page, pageSize, sortBy, sortDir]
  )

  const paginationMeta = useMemo<PaginationMeta>(
    () => ({
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNext,
      hasPrevious,
    }),
    [page, pageSize, totalItems, totalPages, hasNext, hasPrevious]
  )

  // URL sync helper
  const updateUrl = useCallback(
    (newPage: number, newPageSize: number, newSortBy: string, newSortDir: SortDirection) => {
      if (!syncWithUrl) return

      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev)

          // Only add non-default values to URL
          if (newPage !== defaultPage) {
            params.set(getParamName('page'), String(newPage))
          } else {
            params.delete(getParamName('page'))
          }

          if (newPageSize !== defaultPageSize) {
            params.set(getParamName('pageSize'), String(newPageSize))
          } else {
            params.delete(getParamName('pageSize'))
          }

          if (newSortBy && newSortBy !== defaultSortBy) {
            params.set(getParamName('sortBy'), newSortBy)
          } else {
            params.delete(getParamName('sortBy'))
          }

          if (newSortBy && newSortDir !== defaultSortDir) {
            params.set(getParamName('sortDir'), newSortDir)
          } else {
            params.delete(getParamName('sortDir'))
          }

          return params
        },
        { replace: true }
      )
    },
    [syncWithUrl, setSearchParams, getParamName, defaultPage, defaultPageSize, defaultSortBy, defaultSortDir]
  )

  // Control functions
  const setPage = useCallback(
    (newPage: number) => {
      let validPage = newPage
      if (validPage < 1) {
        validPage = 1
      } else if (totalPages > 0 && validPage > totalPages) {
        validPage = totalPages
      }
      setPageState(validPage)
      updateUrl(validPage, pageSize, sortBy, sortDir)
    },
    [totalPages, pageSize, sortBy, sortDir, updateUrl]
  )

  const setPageSize = useCallback(
    (newPageSize: number) => {
      let validPageSize = newPageSize
      if (!PAGE_SIZE_OPTIONS.includes(newPageSize)) {
        console.warn(`Invalid page size: ${newPageSize}. Using default.`)
        validPageSize = defaultPageSize
      }
      setPageSizeState(validPageSize)
      // Reset to first page when page size changes
      setPageState(1)
      updateUrl(1, validPageSize, sortBy, sortDir)
    },
    [defaultPageSize, sortBy, sortDir, updateUrl]
  )

  const setSort = useCallback(
    (newSortBy: string, newSortDir?: SortDirection) => {
      let finalSortDir: SortDirection

      // If clicking the same column, toggle direction
      if (sortBy === newSortBy && newSortDir === undefined) {
        finalSortDir = sortDir === 'asc' ? 'desc' : 'asc'
      } else {
        finalSortDir = newSortDir ?? 'asc'
      }

      setSortByState(newSortBy)
      setSortDirState(finalSortDir)
      // Reset to first page when sort changes
      setPageState(1)
      updateUrl(1, pageSize, newSortBy, finalSortDir)
    },
    [sortBy, sortDir, pageSize, updateUrl]
  )

  const setTotalItems = useCallback(
    (total: number) => {
      setTotalItemsState(total)
    },
    []
  )

  // Adjust page if current page exceeds total pages after totalItems changes
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages)
    }
  }, [totalPages, page, setPage])

  const reset = useCallback(() => {
    setPageState(defaultPage)
    setPageSizeState(defaultPageSize)
    setSortByState(defaultSortBy)
    setSortDirState(defaultSortDir)
    setTotalItemsState(0)
    updateUrl(defaultPage, defaultPageSize, defaultSortBy, defaultSortDir)
  }, [defaultPage, defaultPageSize, defaultSortBy, defaultSortDir, updateUrl])

  const nextPage = useCallback(() => {
    if (hasNext) {
      setPage(page + 1)
    }
  }, [hasNext, page, setPage])

  const previousPage = useCallback(() => {
    if (hasPrevious) {
      setPage(page - 1)
    }
  }, [hasPrevious, page, setPage])

  const firstPage = useCallback(() => {
    setPage(1)
  }, [setPage])

  const lastPage = useCallback(() => {
    if (totalPages > 0) {
      setPage(totalPages)
    }
  }, [totalPages, setPage])

  // Handle browser back/forward (sync state from URL changes)
  useEffect(() => {
    if (!syncWithUrl) return

    const newPage = parseQueryNumber('page', defaultPage)
    const newPageSize = parseQueryNumber('pageSize', defaultPageSize)
    const newSortBy = parseQueryString('sortBy', defaultSortBy)
    const newSortDir = parseQuerySortDir('sortDir', defaultSortDir)

    if (newPage !== page) setPageState(newPage)
    if (newPageSize !== pageSize) setPageSizeState(newPageSize)
    if (newSortBy !== sortBy) setSortByState(newSortBy)
    if (newSortDir !== sortDir) setSortDirState(newSortDir)
  }, [
    searchParams,
    syncWithUrl,
    parseQueryNumber,
    parseQueryString,
    parseQuerySortDir,
    defaultPage,
    defaultPageSize,
    defaultSortBy,
    defaultSortDir,
    page,
    pageSize,
    sortBy,
    sortDir,
  ])

  return {
    // State
    page,
    pageSize,
    sortBy,
    sortDir,
    totalItems,

    // Computed
    totalPages,
    hasNext,
    hasPrevious,
    paginationParams,
    paginationMeta,

    // Control functions
    setPage,
    setPageSize,
    setSort,
    setTotalItems,
    reset,
    nextPage,
    previousPage,
    firstPage,
    lastPage,

    // Constants
    pageSizeOptions: PAGE_SIZE_OPTIONS,
  }
}

export default usePagination
