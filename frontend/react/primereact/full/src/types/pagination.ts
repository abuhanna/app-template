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
 * Standard API response envelope
 */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  pagination?: PaginationMeta
}

/**
 * Paged result alias for convenience
 */
export type PagedResult<T> = ApiResponse<T[]>

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
  sortOrder?: SortDirection
}

/**
 * Pagination state for hooks
 */
export interface PaginationState {
  page: number
  pageSize: number
  sortBy: string
  sortOrder: SortDirection
  totalItems: number
  totalPages: number
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10
export const DEFAULT_SORT_ORDER: SortDirection = 'asc'
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100]
