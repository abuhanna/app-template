// src/stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as userApi from '@/services/userApi'
import { useNotificationStore } from './notification'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/types'

export const useUserStore = defineStore('user', () => {
  const items = ref([])
  const currentItem = ref(null)
  const loading = ref(false)

  // Pagination state
  const pagination = ref({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  })

  // Alias for backward compatibility
  const users = computed(() => items.value)

  const fetchUsers = async (params = {}) => {
    loading.value = true
    const notificationStore = useNotificationStore()

    try {
      const result = await userApi.getUsers(params)

      // Handle paginated response
      if (result && result.items !== undefined) {
        items.value = result.items
        if (result.pagination) {
          pagination.value = {
            page: result.pagination.page,
            pageSize: result.pagination.pageSize,
            totalItems: result.pagination.totalItems,
            totalPages: result.pagination.totalPages,
            hasNext: result.pagination.hasNext,
            hasPrevious: result.pagination.hasPrevious
          }
        }
      } else {
        // Backward compatibility: if result is an array, treat it as non-paginated
        items.value = Array.isArray(result) ? result : []
        pagination.value = {
          page: DEFAULT_PAGE,
          pageSize: DEFAULT_PAGE_SIZE,
          totalItems: items.value.length,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false
        }
      }

      return result
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch users'
      notificationStore.showError(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchUser = async (id) => {
    loading.value = true
    const notificationStore = useNotificationStore()

    try {
      currentItem.value = await userApi.getUserById(id)
      return currentItem.value
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch user'
      notificationStore.showError(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createUser = async (data) => {
    loading.value = true
    const notificationStore = useNotificationStore()

    try {
      const result = await userApi.createUser(data)
      return result
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create user'
      notificationStore.showError(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id, data) => {
    loading.value = true
    const notificationStore = useNotificationStore()

    try {
      const result = await userApi.updateUser(id, data)
      return result
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user'
      notificationStore.showError(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id) => {
    loading.value = true
    const notificationStore = useNotificationStore()

    try {
      await userApi.deleteUser(id)
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user'
      notificationStore.showError(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (id, data) => {
    loading.value = true
    const notificationStore = useNotificationStore()

    try {
      await userApi.changePassword(id, data)
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password'
      notificationStore.showError(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Reset pagination to defaults
  const resetPagination = () => {
    pagination.value = {
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      totalItems: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false
    }
  }

  return {
    items,
    users,
    currentItem,
    loading,
    pagination,
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    changePassword,
    resetPagination
  }
})
