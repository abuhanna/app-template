import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDepartmentStore } from '../department'

vi.mock('@/services/departmentApi', () => ({
  fetchDepartments: vi.fn(),
  fetchDepartment: vi.fn(),
  createDepartment: vi.fn(),
  updateDepartment: vi.fn(),
  deleteDepartment: vi.fn(),
}))

vi.mock('@/stores/notification', () => ({
  useNotificationStore: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}))

import * as departmentApi from '@/services/departmentApi'

describe('Department Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('fetchDepartments', () => {
    it('updates items and pagination on paginated response', async () => {
      const mockResponse = {
        items: [{ id: 1, name: 'IT' }, { id: 2, name: 'HR' }],
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 2,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      }
      vi.mocked(departmentApi.fetchDepartments).mockResolvedValue(mockResponse)

      const store = useDepartmentStore()
      await store.fetchDepartments()

      expect(store.items).toEqual(mockResponse.items)
      expect(store.pagination.totalItems).toBe(2)
    })

    it('handles array response for backward compatibility', async () => {
      const mockArray = [{ id: 1, name: 'IT' }]
      vi.mocked(departmentApi.fetchDepartments).mockResolvedValue(mockArray)

      const store = useDepartmentStore()
      await store.fetchDepartments()

      expect(store.items).toEqual(mockArray)
      expect(store.pagination.totalItems).toBe(1)
      expect(store.pagination.totalPages).toBe(1)
    })

    it('shows error notification on failure', async () => {
      const error = { response: { data: { message: 'Fetch failed' } } }
      vi.mocked(departmentApi.fetchDepartments).mockRejectedValue(error)

      const store = useDepartmentStore()
      await expect(store.fetchDepartments()).rejects.toEqual(error)
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchDepartment', () => {
    it('sets currentItem on success', async () => {
      const dept = { id: 1, name: 'IT', code: 'IT' }
      vi.mocked(departmentApi.fetchDepartment).mockResolvedValue(dept)

      const store = useDepartmentStore()
      const result = await store.fetchDepartment(1)

      expect(store.currentItem).toEqual(dept)
      expect(result).toEqual(dept)
      expect(departmentApi.fetchDepartment).toHaveBeenCalledWith(1)
    })

    it('shows error on failure', async () => {
      const error = { response: { data: { message: 'Not found' } } }
      vi.mocked(departmentApi.fetchDepartment).mockRejectedValue(error)

      const store = useDepartmentStore()
      await expect(store.fetchDepartment(999)).rejects.toEqual(error)
    })
  })

  describe('createDepartment', () => {
    it('calls API and returns result', async () => {
      const newDept = { name: 'Finance', code: 'FIN' }
      const created = { id: 3, ...newDept }
      vi.mocked(departmentApi.createDepartment).mockResolvedValue(created)

      const store = useDepartmentStore()
      const result = await store.createDepartment(newDept)

      expect(departmentApi.createDepartment).toHaveBeenCalledWith(newDept)
      expect(result).toEqual(created)
    })
  })

  describe('updateDepartment', () => {
    it('calls API and returns result', async () => {
      const updateData = { name: 'Updated IT' }
      const updated = { id: 1, name: 'Updated IT' }
      vi.mocked(departmentApi.updateDepartment).mockResolvedValue(updated)

      const store = useDepartmentStore()
      const result = await store.updateDepartment(1, updateData)

      expect(departmentApi.updateDepartment).toHaveBeenCalledWith(1, updateData)
      expect(result).toEqual(updated)
    })
  })

  describe('deleteDepartment', () => {
    it('calls API to delete department', async () => {
      vi.mocked(departmentApi.deleteDepartment).mockResolvedValue(undefined)

      const store = useDepartmentStore()
      await store.deleteDepartment(1)

      expect(departmentApi.deleteDepartment).toHaveBeenCalledWith(1)
    })
  })

  describe('resetPagination', () => {
    it('resets pagination to defaults', async () => {
      const mockResponse = {
        items: [{ id: 1 }],
        pagination: {
          page: 3,
          pageSize: 25,
          totalItems: 50,
          totalPages: 2,
          hasNext: false,
          hasPrevious: true,
        },
      }
      vi.mocked(departmentApi.fetchDepartments).mockResolvedValue(mockResponse)

      const store = useDepartmentStore()
      await store.fetchDepartments()
      expect(store.pagination.page).toBe(3)

      store.resetPagination()

      expect(store.pagination.page).toBe(1)
      expect(store.pagination.pageSize).toBe(10)
      expect(store.pagination.totalItems).toBe(0)
      expect(store.pagination.totalPages).toBe(0)
    })
  })
})
