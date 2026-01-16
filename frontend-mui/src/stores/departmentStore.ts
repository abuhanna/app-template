import { create } from 'zustand'
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '@/types'
import * as departmentApi from '@/services/departmentApi'
import { useNotificationStore } from './notificationStore'

interface DepartmentState {
  departments: Department[]
  selectedDepartment: Department | null
  loading: boolean
  total: number
  page: number
  pageSize: number

  // Actions
  fetchDepartments: (params?: { page?: number; pageSize?: number; search?: string }) => Promise<void>
  fetchDepartment: (id: string) => Promise<void>
  createDepartment: (data: CreateDepartmentRequest) => Promise<Department>
  updateDepartment: (id: string, data: UpdateDepartmentRequest) => Promise<void>
  deleteDepartment: (id: string) => Promise<void>
  setSelectedDepartment: (department: Department | null) => void
  clearDepartments: () => void
}

export const useDepartmentStore = create<DepartmentState>((set) => ({
  departments: [],
  selectedDepartment: null,
  loading: false,
  total: 0,
  page: 1,
  pageSize: 10,

  fetchDepartments: async (params) => {
    set({ loading: true })
    try {
      const response = await departmentApi.getDepartments(params)
      set({
        departments: response.data,
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        loading: false,
      })
    } catch (error) {
      set({ loading: false })
      const notification = useNotificationStore.getState()
      notification.showError('Failed to fetch departments')
      throw error
    }
  },

  fetchDepartment: async (id) => {
    set({ loading: true })
    try {
      const department = await departmentApi.getDepartment(id)
      set({ selectedDepartment: department, loading: false })
    } catch (error) {
      set({ loading: false })
      const notification = useNotificationStore.getState()
      notification.showError('Failed to fetch department')
      throw error
    }
  },

  createDepartment: async (data) => {
    set({ loading: true })
    try {
      const department = await departmentApi.createDepartment(data)
      set((state) => ({
        departments: [...state.departments, department],
        loading: false,
      }))
      const notification = useNotificationStore.getState()
      notification.showSuccess('Department created successfully')
      return department
    } catch (error) {
      set({ loading: false })
      const notification = useNotificationStore.getState()
      notification.showError('Failed to create department')
      throw error
    }
  },

  updateDepartment: async (id, data) => {
    set({ loading: true })
    try {
      const updatedDepartment = await departmentApi.updateDepartment(id, data)
      set((state) => ({
        departments: state.departments.map((d) => (d.id === id ? updatedDepartment : d)),
        selectedDepartment:
          state.selectedDepartment?.id === id ? updatedDepartment : state.selectedDepartment,
        loading: false,
      }))
      const notification = useNotificationStore.getState()
      notification.showSuccess('Department updated successfully')
    } catch (error) {
      set({ loading: false })
      const notification = useNotificationStore.getState()
      notification.showError('Failed to update department')
      throw error
    }
  },

  deleteDepartment: async (id) => {
    set({ loading: true })
    try {
      await departmentApi.deleteDepartment(id)
      set((state) => ({
        departments: state.departments.filter((d) => d.id !== id),
        selectedDepartment:
          state.selectedDepartment?.id === id ? null : state.selectedDepartment,
        loading: false,
      }))
      const notification = useNotificationStore.getState()
      notification.showSuccess('Department deleted successfully')
    } catch (error) {
      set({ loading: false })
      const notification = useNotificationStore.getState()
      notification.showError('Failed to delete department')
      throw error
    }
  },

  setSelectedDepartment: (department) => {
    set({ selectedDepartment: department })
  },

  clearDepartments: () => {
    set({ departments: [], selectedDepartment: null, total: 0 })
  },
}))
