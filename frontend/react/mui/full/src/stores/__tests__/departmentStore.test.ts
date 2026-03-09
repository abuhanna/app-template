import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/services/departmentApi', () => ({
  getDepartments: vi.fn(),
  getDepartment: vi.fn(),
  createDepartment: vi.fn(),
  updateDepartment: vi.fn(),
  deleteDepartment: vi.fn(),
}))

vi.mock('@/stores/notificationStore', () => ({
  useNotificationStore: {
    getState: () => ({
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showInfo: vi.fn(),
    }),
  },
}))

import * as departmentApi from '@/services/departmentApi'
import { useDepartmentStore } from '../departmentStore'

describe('DepartmentStore', () => {
  beforeEach(() => {
    useDepartmentStore.setState({
      departments: [],
      selectedDepartment: null,
      loading: false,
      pagination: null,
    })
    vi.clearAllMocks()
  })

  describe('fetchDepartments', () => {
    it('updates state on success with pagination', async () => {
      const mockResult = {
        success: true,
        message: 'Departments retrieved',
        data: [{ id: 1, code: 'IT', name: 'IT Department', isActive: true, userCount: 5 }],
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      }
      vi.mocked(departmentApi.getDepartments).mockResolvedValue(mockResult as any)

      await useDepartmentStore.getState().fetchDepartments()

      const state = useDepartmentStore.getState()
      expect(state.departments).toEqual(mockResult.data)
      expect(state.pagination).toEqual(mockResult.pagination)
      expect(state.loading).toBe(false)
    })

    it('throws error and sets loading false on failure', async () => {
      vi.mocked(departmentApi.getDepartments).mockRejectedValue(new Error('Failed'))

      await expect(useDepartmentStore.getState().fetchDepartments()).rejects.toThrow('Failed')
      expect(useDepartmentStore.getState().loading).toBe(false)
    })
  })

  describe('fetchDepartment', () => {
    it('updates selectedDepartment', async () => {
      const mockDept = { id: 1, code: 'IT', name: 'IT Dept', isActive: true, userCount: 3 }
      vi.mocked(departmentApi.getDepartment).mockResolvedValue({ success: true, message: '', data: mockDept } as any)

      await useDepartmentStore.getState().fetchDepartment(1)

      expect(useDepartmentStore.getState().selectedDepartment).toEqual(mockDept)
      expect(useDepartmentStore.getState().loading).toBe(false)
    })
  })

  describe('createDepartment', () => {
    it('calls API and adds department to list', async () => {
      const newDept = { id: 2, code: 'HR', name: 'HR Dept', isActive: true, userCount: 0 }
      vi.mocked(departmentApi.createDepartment).mockResolvedValue({ success: true, message: '', data: newDept } as any)

      const result = await useDepartmentStore.getState().createDepartment({
        code: 'HR',
        name: 'HR Dept',
      } as any)

      expect(result).toEqual(newDept)
      expect(useDepartmentStore.getState().departments).toContainEqual(newDept)
    })
  })

  describe('deleteDepartment', () => {
    it('calls API and removes department from list', async () => {
      useDepartmentStore.setState({
        departments: [
          { id: 1, code: 'IT', name: 'IT' } as any,
          { id: 2, code: 'HR', name: 'HR' } as any,
        ],
      })
      vi.mocked(departmentApi.deleteDepartment).mockResolvedValue(undefined)

      await useDepartmentStore.getState().deleteDepartment(1)

      const state = useDepartmentStore.getState()
      expect(state.departments).toHaveLength(1)
      expect(state.departments[0].id).toBe(2)
    })
  })

  describe('clearDepartments', () => {
    it('resets state', () => {
      useDepartmentStore.setState({
        departments: [{ id: 1 } as any],
        selectedDepartment: { id: 1 } as any,
        pagination: { page: 1 } as any,
      })

      useDepartmentStore.getState().clearDepartments()

      const state = useDepartmentStore.getState()
      expect(state.departments).toEqual([])
      expect(state.selectedDepartment).toBeNull()
      expect(state.pagination).toBeNull()
    })
  })
})
