import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'

// usePagination uses useSearchParams which requires a Router context
function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(MemoryRouter, null, children)
}

import { usePagination } from '../usePagination'

describe('usePagination', () => {
  describe('initialization', () => {
    it('initializes with default values', () => {
      const { result } = renderHook(() => usePagination({ syncWithUrl: false }), { wrapper })

      expect(result.current.page).toBe(1)
      expect(result.current.pageSize).toBe(10)
      expect(result.current.sortBy).toBe('')
      expect(result.current.sortDir).toBe('asc')
      expect(result.current.totalItems).toBe(0)
      expect(result.current.totalPages).toBe(0)
    })

    it('initializes with custom defaults', () => {
      const { result } = renderHook(
        () =>
          usePagination({
            defaultPage: 2,
            defaultPageSize: 25,
            defaultSortBy: 'name',
            defaultSortDir: 'desc',
            syncWithUrl: false,
          }),
        { wrapper }
      )

      expect(result.current.page).toBe(2)
      expect(result.current.pageSize).toBe(25)
      expect(result.current.sortBy).toBe('name')
      expect(result.current.sortDir).toBe('desc')
    })
  })

  describe('setPage', () => {
    it('updates current page', () => {
      const { result } = renderHook(() => usePagination({ syncWithUrl: false }), { wrapper })

      act(() => {
        result.current.setTotalItems(100)
      })

      act(() => {
        result.current.setPage(3)
      })

      expect(result.current.page).toBe(3)
    })

    it('clamps page to minimum of 1', () => {
      const { result } = renderHook(() => usePagination({ syncWithUrl: false }), { wrapper })

      act(() => {
        result.current.setPage(-1)
      })

      expect(result.current.page).toBe(1)
    })

    it('clamps page to maximum totalPages', () => {
      const { result } = renderHook(() => usePagination({ syncWithUrl: false }), { wrapper })

      act(() => {
        result.current.setTotalItems(30)
      })

      act(() => {
        result.current.setPage(999)
      })

      // totalPages = ceil(30 / 10) = 3
      expect(result.current.page).toBe(3)
    })
  })

  describe('setPageSize', () => {
    it('updates page size and resets page to 1', () => {
      const { result } = renderHook(() => usePagination({ syncWithUrl: false }), { wrapper })

      act(() => {
        result.current.setTotalItems(100)
      })

      act(() => {
        result.current.setPage(5)
      })

      act(() => {
        result.current.setPageSize(25)
      })

      expect(result.current.pageSize).toBe(25)
      expect(result.current.page).toBe(1)
    })
  })

  describe('setSort', () => {
    it('changes sort column and direction', () => {
      const { result } = renderHook(() => usePagination({ syncWithUrl: false }), { wrapper })

      act(() => {
        result.current.setSort('email', 'desc')
      })

      expect(result.current.sortBy).toBe('email')
      expect(result.current.sortDir).toBe('desc')
      expect(result.current.page).toBe(1)
    })

    it('toggles direction when clicking same column without specifying direction', () => {
      const { result } = renderHook(
        () => usePagination({ defaultSortBy: 'name', defaultSortDir: 'asc', syncWithUrl: false }),
        { wrapper }
      )

      act(() => {
        result.current.setSort('name')
      })

      expect(result.current.sortDir).toBe('desc')

      act(() => {
        result.current.setSort('name')
      })

      expect(result.current.sortDir).toBe('asc')
    })
  })

  describe('reset', () => {
    it('restores defaults', () => {
      const { result } = renderHook(
        () => usePagination({ defaultPageSize: 10, syncWithUrl: false }),
        { wrapper }
      )

      act(() => {
        result.current.setTotalItems(100)
      })

      act(() => {
        result.current.setPage(3)
        result.current.setSort('email', 'desc')
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.page).toBe(1)
      expect(result.current.pageSize).toBe(10)
      expect(result.current.sortBy).toBe('')
      expect(result.current.sortDir).toBe('asc')
      expect(result.current.totalItems).toBe(0)
    })
  })

  describe('computed values', () => {
    it('totalPages computed correctly', () => {
      const { result } = renderHook(
        () => usePagination({ defaultPageSize: 10, syncWithUrl: false }),
        { wrapper }
      )

      act(() => {
        result.current.setTotalItems(25)
      })

      expect(result.current.totalPages).toBe(3)
    })

    it('hasNext returns true when not on last page', () => {
      const { result } = renderHook(
        () => usePagination({ defaultPageSize: 10, syncWithUrl: false }),
        { wrapper }
      )

      act(() => {
        result.current.setTotalItems(30)
      })

      // page 1 of 3
      expect(result.current.hasNext).toBe(true)
    })

    it('hasNext returns false on last page', () => {
      const { result } = renderHook(
        () => usePagination({ defaultPageSize: 10, syncWithUrl: false }),
        { wrapper }
      )

      act(() => {
        result.current.setTotalItems(30)
      })

      act(() => {
        result.current.setPage(3)
      })

      expect(result.current.hasNext).toBe(false)
    })

    it('hasPrevious returns false on first page', () => {
      const { result } = renderHook(
        () => usePagination({ syncWithUrl: false }),
        { wrapper }
      )

      expect(result.current.hasPrevious).toBe(false)
    })

    it('hasPrevious returns true when not on first page', () => {
      const { result } = renderHook(
        () => usePagination({ syncWithUrl: false }),
        { wrapper }
      )

      act(() => {
        result.current.setTotalItems(30)
      })

      act(() => {
        result.current.setPage(2)
      })

      expect(result.current.hasPrevious).toBe(true)
    })
  })
})
