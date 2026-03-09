import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as authApi from '@/services/authApi'
import * as userApi from '@/services/userApi'

import { useUserStore } from '../user'

vi.mock('@/services/userApi', () => ({
  getUsers: vi.fn(),
  getUserById: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}))

vi.mock('@/services/authApi', () => ({
  changePassword: vi.fn(),
}))

vi.mock('@/stores/notification', () => ({
  useNotificationStore: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}))

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('fetchUsers', () => {
    it('updates items and pagination on paginated response', async () => {
      const mockResponse = {
        success: true,
        data: [{ id: 1, username: 'admin' }, { id: 2, username: 'user1' }],
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 2,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      }
      vi.mocked(userApi.getUsers).mockResolvedValue(mockResponse)

      const store = useUserStore()
      await store.fetchUsers()

      expect(store.items).toEqual(mockResponse.data)
      expect(store.pagination.page).toBe(1)
      expect(store.pagination.totalItems).toBe(2)
      expect(store.pagination.totalPages).toBe(1)
    })

    it('handles array response for backward compatibility', async () => {
      const mockArray = [{ id: 1 }, { id: 2 }, { id: 3 }]
      vi.mocked(userApi.getUsers).mockResolvedValue(mockArray)

      const store = useUserStore()
      await store.fetchUsers()

      expect(store.items).toEqual(mockArray)
      expect(store.pagination.page).toBe(1)
      expect(store.pagination.pageSize).toBe(10)
      expect(store.pagination.totalItems).toBe(3)
      expect(store.pagination.totalPages).toBe(1)
      expect(store.pagination.hasNext).toBe(false)
      expect(store.pagination.hasPrevious).toBe(false)
    })

    it('shows error notification on failure', async () => {
      const error = { response: { data: { message: 'Server error' } } }
      vi.mocked(userApi.getUsers).mockRejectedValue(error)

      const store = useUserStore()
      await expect(store.fetchUsers()).rejects.toEqual(error)
    })

    it('sets loading true during call and false after', async () => {
      vi.mocked(userApi.getUsers).mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve([]), 10)
        })
      })

      const store = useUserStore()
      const promise = store.fetchUsers()
      expect(store.loading).toBe(true)

      await promise
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchUser', () => {
    it('sets currentItem on success', async () => {
      const mockUser = { id: 1, username: 'admin', email: 'admin@test.com' }
      vi.mocked(userApi.getUserById).mockResolvedValue({ success: true, data: mockUser })

      const store = useUserStore()
      const result = await store.fetchUser(1)

      expect(store.currentItem).toEqual(mockUser)
      expect(result).toEqual(mockUser)
      expect(userApi.getUserById).toHaveBeenCalledWith(1)
    })

    it('shows error on failure', async () => {
      const error = { response: { data: { message: 'Not found' } } }
      vi.mocked(userApi.getUserById).mockRejectedValue(error)

      const store = useUserStore()
      await expect(store.fetchUser(999)).rejects.toEqual(error)
      expect(store.loading).toBe(false)
    })
  })

  describe('createUser', () => {
    it('calls API and returns result', async () => {
      const newUser = { username: 'newuser', email: 'new@test.com' }
      const created = { id: 3, ...newUser }
      vi.mocked(userApi.createUser).mockResolvedValue(created)

      const store = useUserStore()
      const result = await store.createUser(newUser)

      expect(userApi.createUser).toHaveBeenCalledWith(newUser)
      expect(result).toEqual(created)
    })
  })

  describe('updateUser', () => {
    it('calls API and returns result', async () => {
      const updateData = { username: 'updated' }
      const updated = { id: 1, username: 'updated' }
      vi.mocked(userApi.updateUser).mockResolvedValue(updated)

      const store = useUserStore()
      const result = await store.updateUser(1, updateData)

      expect(userApi.updateUser).toHaveBeenCalledWith(1, updateData)
      expect(result).toEqual(updated)
    })
  })

  describe('deleteUser', () => {
    it('calls API to delete user', async () => {
      vi.mocked(userApi.deleteUser).mockResolvedValue(undefined)

      const store = useUserStore()
      await store.deleteUser(1)

      expect(userApi.deleteUser).toHaveBeenCalledWith(1)
    })
  })

  describe('changePassword', () => {
    it('calls authApi to change password', async () => {
      const passwordData = { currentPassword: 'old', newPassword: 'new' }
      vi.mocked(authApi.changePassword).mockResolvedValue(undefined)

      const store = useUserStore()
      await store.changePassword(passwordData)

      expect(authApi.changePassword).toHaveBeenCalledWith(passwordData)
    })
  })

  describe('resetPagination', () => {
    it('resets pagination to defaults', async () => {
      const mockResponse = {
        success: true,
        data: [{ id: 1 }],
        pagination: {
          page: 5,
          pageSize: 25,
          totalItems: 100,
          totalPages: 4,
          hasNext: true,
          hasPrevious: true,
        },
      }
      vi.mocked(userApi.getUsers).mockResolvedValue(mockResponse)

      const store = useUserStore()
      await store.fetchUsers()
      expect(store.pagination.page).toBe(5)

      store.resetPagination()

      expect(store.pagination.page).toBe(1)
      expect(store.pagination.pageSize).toBe(10)
      expect(store.pagination.totalItems).toBe(0)
      expect(store.pagination.totalPages).toBe(0)
      expect(store.pagination.hasNext).toBe(false)
      expect(store.pagination.hasPrevious).toBe(false)
    })
  })
})
