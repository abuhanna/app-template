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
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
} from '../userApi'

describe('User API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getUsers calls api.get with params', async () => {
    const params = { page: 1, pageSize: 10 }
    const mockData = { items: [], pagination: {} }
    vi.mocked(api.get).mockResolvedValue({ data: mockData })

    const result = await getUsers(params)

    expect(api.get).toHaveBeenCalledWith('/users', { params })
    expect(result).toEqual(mockData)
  })

  it('getUserById calls api.get with user id', async () => {
    const mockUser = { id: 1, username: 'admin' }
    vi.mocked(api.get).mockResolvedValue({ data: mockUser })

    const result = await getUserById(1)

    expect(api.get).toHaveBeenCalledWith('/users/1')
    expect(result).toEqual(mockUser)
  })

  it('createUser calls api.post with user data', async () => {
    const userData = { username: 'new', email: 'new@test.com' }
    const created = { id: 3, ...userData }
    vi.mocked(api.post).mockResolvedValue({ data: created })

    const result = await createUser(userData)

    expect(api.post).toHaveBeenCalledWith('/users', userData)
    expect(result).toEqual(created)
  })

  it('updateUser calls api.put with id and data', async () => {
    const updateData = { username: 'updated' }
    const updated = { id: 1, username: 'updated' }
    vi.mocked(api.put).mockResolvedValue({ data: updated })

    const result = await updateUser(1, updateData)

    expect(api.put).toHaveBeenCalledWith('/users/1', updateData)
    expect(result).toEqual(updated)
  })

  it('deleteUser calls api.delete with id', async () => {
    vi.mocked(api.delete).mockResolvedValue(undefined)

    await deleteUser(1)

    expect(api.delete).toHaveBeenCalledWith('/users/1')
  })

  it('changePassword calls api.post with id and password data', async () => {
    const passwordData = { currentPassword: 'old', newPassword: 'new' }
    vi.mocked(api.post).mockResolvedValue({ data: {} })

    const result = await changePassword(1, passwordData)

    expect(api.post).toHaveBeenCalledWith('/users/1/change-password', passwordData)
    expect(result).toEqual({})
  })
})
