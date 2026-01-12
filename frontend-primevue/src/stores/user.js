// src/stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as userApi from '@/services/userApi'
import { useNotificationStore } from './notification'

export const useUserStore = defineStore('user', () => {
  const items = ref([])
  const currentItem = ref(null)
  const loading = ref(false)

  // Alias for backward compatibility
  const users = computed(() => items.value)

  const fetchUsers = async (params = {}) => {
    loading.value = true
    const notificationStore = useNotificationStore()

    try {
      items.value = await userApi.getUsers(params)
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

  return {
    items,
    users,
    currentItem,
    loading,
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    changePassword
  }
})
