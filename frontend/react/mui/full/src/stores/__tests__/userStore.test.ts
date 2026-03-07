import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/services/userApi', () => ({
  getUsers: vi.fn(),
  getUser: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
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

import * as userApi from '@/services/userApi'
import { useUserStore } from '../userStore'

describe('UserStore', () => {
  beforeEach(() => {
    useUserStore.setState({
      users: [],
      selectedUser: null,
      loading: false,
      pagination: null,
    })
    vi.clearAllMocks()
  })

  describe('fetchUsers', () => {
    it('updates state on success with pagination', async () => {
      const mockResult = {
        items: [
          { id: '1', username: 'admin', email: 'admin@test.com', role: 'Admin', isActive: true },
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      }
      vi.mocked(userApi.getUsers).mockResolvedValue(mockResult as any)

      await useUserStore.getState().fetchUsers()

      const state = useUserStore.getState()
      expect(state.users).toEqual(mockResult.items)
      expect(state.pagination).toEqual(mockResult.pagination)
      expect(state.loading).toBe(false)
    })

    it('throws error and sets loading false on failure', async () => {
      vi.mocked(userApi.getUsers).mockRejectedValue(new Error('Network error'))

      await expect(useUserStore.getState().fetchUsers()).rejects.toThrow('Network error')
      expect(useUserStore.getState().loading).toBe(false)
    })
  })

  describe('fetchUser', () => {
    it('updates selectedUser', async () => {
      const mockUser = { id: '1', username: 'admin', email: 'admin@test.com', role: 'Admin', isActive: true }
      vi.mocked(userApi.getUser).mockResolvedValue(mockUser as any)

      await useUserStore.getState().fetchUser('1')

      expect(useUserStore.getState().selectedUser).toEqual(mockUser)
      expect(useUserStore.getState().loading).toBe(false)
    })
  })

  describe('createUser', () => {
    it('calls API and adds user to list', async () => {
      const newUser = { id: '2', username: 'new', email: 'new@test.com', role: 'User', isActive: true }
      vi.mocked(userApi.createUser).mockResolvedValue(newUser as any)

      const result = await useUserStore.getState().createUser({
        username: 'new',
        email: 'new@test.com',
        password: 'pass',
      } as any)

      expect(result).toEqual(newUser)
      expect(useUserStore.getState().users).toContainEqual(newUser)
    })
  })

  describe('updateUser', () => {
    it('calls API and updates user in list', async () => {
      const existingUser = { id: '1', username: 'old', email: 'old@test.com', role: 'User', isActive: true }
      const updatedUser = { id: '1', username: 'updated', email: 'updated@test.com', role: 'User', isActive: true }
      useUserStore.setState({ users: [existingUser as any] })
      vi.mocked(userApi.updateUser).mockResolvedValue(updatedUser as any)

      await useUserStore.getState().updateUser('1', { username: 'updated' } as any)

      expect(useUserStore.getState().users[0].username).toBe('updated')
    })
  })

  describe('deleteUser', () => {
    it('calls API and removes user from list', async () => {
      useUserStore.setState({
        users: [
          { id: '1', username: 'u1' } as any,
          { id: '2', username: 'u2' } as any,
        ],
      })
      vi.mocked(userApi.deleteUser).mockResolvedValue(undefined)

      await useUserStore.getState().deleteUser('1')

      const state = useUserStore.getState()
      expect(state.users).toHaveLength(1)
      expect(state.users[0].id).toBe('2')
    })
  })

  describe('setSelectedUser', () => {
    it('updates state', () => {
      const user = { id: '1', username: 'admin' } as any
      useUserStore.getState().setSelectedUser(user)
      expect(useUserStore.getState().selectedUser).toEqual(user)
    })
  })

  describe('clearUsers', () => {
    it('resets state', () => {
      useUserStore.setState({
        users: [{ id: '1' } as any],
        selectedUser: { id: '1' } as any,
        pagination: { page: 1 } as any,
      })

      useUserStore.getState().clearUsers()

      const state = useUserStore.getState()
      expect(state.users).toEqual([])
      expect(state.selectedUser).toBeNull()
      expect(state.pagination).toBeNull()
    })
  })
})
