import { create } from 'zustand'
import type { User, CreateUserRequest, UpdateUserRequest, PaginationMeta } from '@/types'
import type { GetUsersParams } from '@/services/userApi'
import * as userApi from '@/services/userApi'
import { useNotificationStore } from './notificationStore'

interface UserState {
  users: User[]
  selectedUser: User | null
  loading: boolean
  pagination: PaginationMeta | null

  // Actions
  fetchUsers: (params?: GetUsersParams) => Promise<void>
  fetchUser: (id: string) => Promise<void>
  createUser: (data: CreateUserRequest) => Promise<User>
  updateUser: (id: string, data: UpdateUserRequest) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  setSelectedUser: (user: User | null) => void
  clearUsers: () => void
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  selectedUser: null,
  loading: false,
  pagination: null,

  fetchUsers: async (params) => {
    set({ loading: true })
    try {
      const result = await userApi.getUsers(params)
      set({
        users: result.items,
        pagination: result.pagination,
        loading: false,
      })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  fetchUser: async (id) => {
    set({ loading: true })
    try {
      const user = await userApi.getUser(id)
      set({ selectedUser: user, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  createUser: async (data) => {
    set({ loading: true })
    try {
      const user = await userApi.createUser(data)
      set((state) => ({
        users: [...state.users, user],
        loading: false,
      }))
      const notification = useNotificationStore.getState()
      notification.showSuccess('User created successfully')
      return user
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  updateUser: async (id, data) => {
    set({ loading: true })
    try {
      const updatedUser = await userApi.updateUser(id, data)
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updatedUser : u)),
        selectedUser: state.selectedUser?.id === id ? updatedUser : state.selectedUser,
        loading: false,
      }))
      const notification = useNotificationStore.getState()
      notification.showSuccess('User updated successfully')
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  deleteUser: async (id) => {
    set({ loading: true })
    try {
      await userApi.deleteUser(id)
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
        loading: false,
      }))
      const notification = useNotificationStore.getState()
      notification.showSuccess('User deleted successfully')
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user })
  },

  clearUsers: () => {
    set({ users: [], selectedUser: null, pagination: null })
  },
}))
