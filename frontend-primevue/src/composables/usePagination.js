import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_DIR,
  PAGE_SIZE_OPTIONS
} from '@/types/pagination'

/**
 * Pagination composable
 *
 * Manages pagination state with optional URL query parameter synchronization
 * for bookmarkable pages.
 *
 * @param {Object} options - Configuration options
 * @param {number} options.defaultPage - Default page number (default: 1)
 * @param {number} options.defaultPageSize - Default page size (default: 10)
 * @param {string} options.defaultSortBy - Default sort field
 * @param {'asc'|'desc'} options.defaultSortDir - Default sort direction (default: 'asc')
 * @param {boolean} options.syncWithUrl - Sync pagination state with URL query params (default: true)
 * @param {string} options.urlPrefix - Query param prefix for URL sync
 * @returns {Object} Pagination state and control functions
 *
 * @example
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
 */
export function usePagination(options = {}) {
  const {
    defaultPage = DEFAULT_PAGE,
    defaultPageSize = DEFAULT_PAGE_SIZE,
    defaultSortBy = '',
    defaultSortDir = DEFAULT_SORT_DIR,
    syncWithUrl = true,
    urlPrefix = ''
  } = options

  const route = useRoute()
  const router = useRouter()

  // Helper to get prefixed param name
  const getParamName = (name) => {
    return urlPrefix ? `${urlPrefix}_${name}` : name
  }

  // Helper to parse query param as number
  const parseQueryNumber = (value, defaultValue) => {
    if (Array.isArray(value)) {
      value = value[0]
    }
    if (!value) return defaultValue
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? defaultValue : parsed
  }

  // Helper to parse query param as string
  const parseQueryString = (value, defaultValue) => {
    if (Array.isArray(value)) {
      value = value[0]
    }
    return value || defaultValue
  }

  // Helper to parse sort direction
  const parseQuerySortDir = (value, defaultValue) => {
    if (Array.isArray(value)) {
      value = value[0]
    }
    if (value === 'asc' || value === 'desc') {
      return value
    }
    return defaultValue
  }

  // Initialize state from URL if syncWithUrl is enabled
  const getInitialPage = () => {
    if (syncWithUrl) {
      return parseQueryNumber(route.query[getParamName('page')], defaultPage)
    }
    return defaultPage
  }

  const getInitialPageSize = () => {
    if (syncWithUrl) {
      const size = parseQueryNumber(route.query[getParamName('pageSize')], defaultPageSize)
      // Validate page size is in allowed options
      return PAGE_SIZE_OPTIONS.includes(size) ? size : defaultPageSize
    }
    return defaultPageSize
  }

  const getInitialSortBy = () => {
    if (syncWithUrl) {
      return parseQueryString(route.query[getParamName('sortBy')], defaultSortBy)
    }
    return defaultSortBy
  }

  const getInitialSortDir = () => {
    if (syncWithUrl) {
      return parseQuerySortDir(route.query[getParamName('sortDir')], defaultSortDir)
    }
    return defaultSortDir
  }

  // Reactive state
  const page = ref(getInitialPage())
  const pageSize = ref(getInitialPageSize())
  const sortBy = ref(getInitialSortBy())
  const sortDir = ref(getInitialSortDir())
  const totalItems = ref(0)

  // Computed properties
  const totalPages = computed(() => {
    if (totalItems.value === 0) return 0
    return Math.ceil(totalItems.value / pageSize.value)
  })

  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrevious = computed(() => page.value > 1)

  const paginationParams = computed(() => ({
    page: page.value,
    pageSize: pageSize.value,
    ...(sortBy.value && { sortBy: sortBy.value }),
    ...(sortBy.value && { sortDir: sortDir.value })
  }))

  const paginationMeta = computed(() => ({
    page: page.value,
    pageSize: pageSize.value,
    totalItems: totalItems.value,
    totalPages: totalPages.value,
    hasNext: hasNext.value,
    hasPrevious: hasPrevious.value
  }))

  // URL sync helper
  const updateUrl = () => {
    if (!syncWithUrl) return

    const query = { ...route.query }

    // Only add non-default values to URL
    if (page.value !== defaultPage) {
      query[getParamName('page')] = String(page.value)
    } else {
      delete query[getParamName('page')]
    }

    if (pageSize.value !== defaultPageSize) {
      query[getParamName('pageSize')] = String(pageSize.value)
    } else {
      delete query[getParamName('pageSize')]
    }

    if (sortBy.value && sortBy.value !== defaultSortBy) {
      query[getParamName('sortBy')] = sortBy.value
    } else {
      delete query[getParamName('sortBy')]
    }

    if (sortBy.value && sortDir.value !== defaultSortDir) {
      query[getParamName('sortDir')] = sortDir.value
    } else {
      delete query[getParamName('sortDir')]
    }

    router.replace({ query })
  }

  // Control functions
  const setPage = (newPage) => {
    if (newPage < 1) {
      page.value = 1
    } else if (totalPages.value > 0 && newPage > totalPages.value) {
      page.value = totalPages.value
    } else {
      page.value = newPage
    }
  }

  const setPageSize = (newPageSize) => {
    if (!PAGE_SIZE_OPTIONS.includes(newPageSize)) {
      console.warn(`Invalid page size: ${newPageSize}. Using default.`)
      pageSize.value = defaultPageSize
    } else {
      pageSize.value = newPageSize
    }
    // Reset to first page when page size changes
    page.value = 1
  }

  const setSort = (newSortBy, newSortDir) => {
    // If clicking the same column, toggle direction
    if (sortBy.value === newSortBy && newSortDir === undefined) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = newSortBy
      sortDir.value = newSortDir ?? 'asc'
    }
    // Reset to first page when sort changes
    page.value = 1
  }

  const setTotalItems = (total) => {
    totalItems.value = total
    // Adjust page if current page exceeds total pages
    if (totalPages.value > 0 && page.value > totalPages.value) {
      page.value = totalPages.value
    }
  }

  const reset = () => {
    page.value = defaultPage
    pageSize.value = defaultPageSize
    sortBy.value = defaultSortBy
    sortDir.value = defaultSortDir
    totalItems.value = 0
  }

  const nextPage = () => {
    if (hasNext.value) {
      setPage(page.value + 1)
    }
  }

  const previousPage = () => {
    if (hasPrevious.value) {
      setPage(page.value - 1)
    }
  }

  const firstPage = () => {
    setPage(1)
  }

  const lastPage = () => {
    if (totalPages.value > 0) {
      setPage(totalPages.value)
    }
  }

  // Watch for changes and update URL
  if (syncWithUrl) {
    watch([page, pageSize, sortBy, sortDir], () => {
      updateUrl()
    })

    // Handle browser back/forward
    watch(
      () => route.query,
      (newQuery) => {
        const newPage = parseQueryNumber(newQuery[getParamName('page')], defaultPage)
        const newPageSize = parseQueryNumber(newQuery[getParamName('pageSize')], defaultPageSize)
        const newSortBy = parseQueryString(newQuery[getParamName('sortBy')], defaultSortBy)
        const newSortDir = parseQuerySortDir(newQuery[getParamName('sortDir')], defaultSortDir)

        if (newPage !== page.value) page.value = newPage
        if (newPageSize !== pageSize.value) pageSize.value = newPageSize
        if (newSortBy !== sortBy.value) sortBy.value = newSortBy
        if (newSortDir !== sortDir.value) sortDir.value = newSortDir
      }
    )
  }

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
    pageSizeOptions: PAGE_SIZE_OPTIONS
  }
}
