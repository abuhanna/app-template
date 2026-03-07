import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '../api'
import { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment } from '../departmentApi'

describe('Department API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDepartments', () => {
    it('gets from /departments with params', async () => {
      const mockData = { items: [], pagination: {} }
      vi.mocked(api.get).mockResolvedValue({ data: mockData })

      const params = { page: 1, pageSize: 10 }
      const result = await getDepartments(params)

      expect(api.get).toHaveBeenCalledWith('/departments', { params })
      expect(result).toEqual(mockData)
    })
  })

  describe('getDepartment', () => {
    it('gets from /departments/:id', async () => {
      const mockDept = { id: '1', code: 'IT', name: 'IT' }
      vi.mocked(api.get).mockResolvedValue({ data: mockDept })

      const result = await getDepartment('1')

      expect(api.get).toHaveBeenCalledWith('/departments/1')
      expect(result).toEqual(mockDept)
    })
  })

  describe('createDepartment', () => {
    it('posts to /departments', async () => {
      const data = { code: 'HR', name: 'HR Dept' }
      const mockResponse = { id: '2', ...data }
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await createDepartment(data as any)

      expect(api.post).toHaveBeenCalledWith('/departments', data)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateDepartment', () => {
    it('puts to /departments/:id', async () => {
      const data = { name: 'Updated Dept' }
      const mockResponse = { id: '1', code: 'IT', name: 'Updated Dept' }
      vi.mocked(api.put).mockResolvedValue({ data: mockResponse })

      const result = await updateDepartment('1', data as any)

      expect(api.put).toHaveBeenCalledWith('/departments/1', data)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteDepartment', () => {
    it('deletes /departments/:id', async () => {
      vi.mocked(api.delete).mockResolvedValue({})

      await deleteDepartment('1')

      expect(api.delete).toHaveBeenCalledWith('/departments/1')
    })
  })
})
