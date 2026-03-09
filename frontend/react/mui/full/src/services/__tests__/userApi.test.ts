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
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../userApi'

describe('User API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUsers', () => {
    it('gets from /users with params', async () => {
      const mockData = { success: true, data: [], pagination: {} }
      vi.mocked(api.get).mockResolvedValue({ data: mockData })

      const params = { page: 1, pageSize: 10, search: 'admin' }
      const result = await getUsers(params)

      expect(api.get).toHaveBeenCalledWith('/users', { params })
      expect(result).toEqual(mockData)
    })
  })

  describe('getUser', () => {
    it('gets from /users/:id', async () => {
      const mockData = { success: true, data: { id: 1, username: 'admin' } }
      vi.mocked(api.get).mockResolvedValue({ data: mockData })

      const result = await getUser(1)

      expect(api.get).toHaveBeenCalledWith('/users/1')
      expect(result).toEqual(mockData)
    })
  })

  describe('createUser', () => {
    it('posts to /users', async () => {
      const newUser = { username: 'new', email: 'new@test.com', password: 'pass' }
      const mockResponse = { success: true, data: { id: 2, ...newUser } }
      vi.mocked(api.post).mockResolvedValue({ data: mockResponse })

      const result = await createUser(newUser as any)

      expect(api.post).toHaveBeenCalledWith('/users', newUser)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateUser', () => {
    it('puts to /users/:id', async () => {
      const data = { email: 'updated@test.com' }
      const mockResponse = { success: true, data: { id: 1, email: 'updated@test.com' } }
      vi.mocked(api.put).mockResolvedValue({ data: mockResponse })

      const result = await updateUser(1, data as any)

      expect(api.put).toHaveBeenCalledWith('/users/1', data)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteUser', () => {
    it('deletes /users/:id', async () => {
      vi.mocked(api.delete).mockResolvedValue({})

      await deleteUser(1)

      expect(api.delete).toHaveBeenCalledWith('/users/1')
    })
  })
})
