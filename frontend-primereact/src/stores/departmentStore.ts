import { create } from 'zustand'
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '@/types'
import * as departmentApi from '@/services/departmentApi'

interface DepartmentState {
  departments: Department[]
  selectedDepartment: Department | null
  loading: boolean

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

  fetchDepartments: async (params) => {
    set({ loading: true })
    try {
      const departments = await departmentApi.getDepartments(params)
      set({ departments, loading: false })
    } catch (error) {
      set({ loading: false })
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
      return department
    } catch (error) {
      set({ loading: false })
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
    } catch (error) {
      set({ loading: false })
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
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  setSelectedDepartment: (department) => {
    set({ selectedDepartment: department })
  },

  clearDepartments: () => {
    set({ departments: [], selectedDepartment: null })
  },
}))
