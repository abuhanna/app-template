// src/stores/department.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as departmentApi from '@/services/departmentApi'
import { useNotificationStore } from './notification'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/types'

export const useDepartmentStore = defineStore('department', () => {
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
  const departments = computed(() => items.value)

  const fetchDepartments = async (params = {}) => {
    loading.value = true
    const notificationStore = useNotificationStore()

    try {
      const result = await departmentApi.fetchDepartments(params)

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
    departments,
    currentItem,
    loading,
    pagination,
    fetchDepartments,
    fetchDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    resetPagination
  }
})
