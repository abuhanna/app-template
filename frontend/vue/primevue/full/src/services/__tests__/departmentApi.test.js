import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from '../api'
import {
  createDepartment,
  deleteDepartment,
  fetchDepartment,
  fetchDepartments,
  updateDepartment,
} from '../departmentApi'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Department API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchDepartments calls api.get with params', async () => {
    const params = { page: 1, pageSize: 10 }
    const mockData = { items: [], pagination: {} }
    vi.mocked(api.get).mockResolvedValue({ data: mockData })

    const result = await fetchDepartments(params)

    expect(api.get).toHaveBeenCalledWith('/departments', { params })
    expect(result).toEqual(mockData)
  })

  it('fetchDepartment calls api.get with id', async () => {
    const mockDept = { id: 1, name: 'IT', code: 'IT' }
    vi.mocked(api.get).mockResolvedValue({ data: mockDept })

    const result = await fetchDepartment(1)

    expect(api.get).toHaveBeenCalledWith('/departments/1')
    expect(result).toEqual(mockDept)
  })

  it('createDepartment calls api.post with data', async () => {
    const deptData = { name: 'Finance', code: 'FIN' }
    const created = { id: 3, ...deptData }
    vi.mocked(api.post).mockResolvedValue({ data: created })

    const result = await createDepartment(deptData)

    expect(api.post).toHaveBeenCalledWith('/departments', deptData)
    expect(result).toEqual(created)
  })

  it('updateDepartment calls api.put with id and data', async () => {
    const updateData = { name: 'Updated IT' }
    const updated = { id: 1, name: 'Updated IT' }
    vi.mocked(api.put).mockResolvedValue({ data: updated })

    const result = await updateDepartment(1, updateData)

    expect(api.put).toHaveBeenCalledWith('/departments/1', updateData)
    expect(result).toEqual(updated)
  })

  it('deleteDepartment calls api.delete with id', async () => {
    vi.mocked(api.delete).mockResolvedValue(undefined)

    await deleteDepartment(1)

    expect(api.delete).toHaveBeenCalledWith('/departments/1')
  })
})
