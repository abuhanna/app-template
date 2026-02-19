/**
 * Pagination types for API responses and hooks
 */

/**
 * Pagination metadata returned by the API
 */
export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

/**
 * Generic paged result from API
 */
export interface PagedResult<T> {
  items: T[]
  pagination: PaginationMeta
}

/**
 * Sort direction for queries
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Pagination query parameters sent to the API
 */
export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortDir?: SortDirection
}

/**
 * Pagination state for hooks
 */
export interface PaginationState {
  page: number
  pageSize: number
  sortBy: string
  sortDir: SortDirection
  totalItems: number
  totalPages: number
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10
export const DEFAULT_SORT_DIR: SortDirection = 'asc'
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100]
