// src/stores/department.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as departmentApi from '@/services/departmentApi'
import { useNotificationStore } from './notification'

export const useDepartmentStore = defineStore('department', () => {
  const items = ref([])
  const currentItem = ref(null)
  const loading = ref(false)

  // Alias for backward compatibility
  const departments = computed(() => items.value)

  const fetchDepartments = async (params = {}) => {
    loading.value = true
    const notificationStore = useNotificationStore()

    try {
      items.value = await departmentApi.fetchDepartments(params)
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch departments'
      notificationStore.showError(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchDepartment = async (id) => {
    loading.value = true
    const notificationStore = useNotificationStore()

    try {
      currentItem.value = await departmentApi.fetchDepartment(id)
      return currentItem.value
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch department'
      notificationStore.showError(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createDepartment = async (data) => {
    loading.value = true
    const notificationStore = useNotificationStore()

    try {
      const result = await departmentApi.createDepartment(data)
      return result
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create department'
      notificationStore.showError(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateDepartment = async (id, data) => {
    loading.value = true
    const notificationStore = useNotificationStore()

    try {
      const result = await departmentApi.updateDepartment(id, data)
      return result
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update department'
      notificationStore.showError(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteDepartment = async (id) => {
    loading.value = true
    const notificationStore = useNotificationStore()

    try {
      await departmentApi.deleteDepartment(id)
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete department'
      notificationStore.showError(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    departments,
    currentItem,
    loading,
    fetchDepartments,
    fetchDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment
  }
})
