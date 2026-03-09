import { create } from 'zustand'
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest, PaginationMeta } from '@/types'
import type { GetDepartmentsParams } from '@/services/departmentApi'
import * as departmentApi from '@/services/departmentApi'

interface DepartmentState {
  departments: Department[]
  selectedDepartment: Department | null
  loading: boolean
  pagination: PaginationMeta | null

  // Actions
  fetchDepartments: (params?: GetDepartmentsParams) => Promise<void>
  fetchDepartment: (id: number) => Promise<void>
  createDepartment: (data: CreateDepartmentRequest) => Promise<Department>
  updateDepartment: (id: number, data: UpdateDepartmentRequest) => Promise<void>
  deleteDepartment: (id: number) => Promise<void>
  setSelectedDepartment: (department: Department | null) => void
  clearDepartments: () => void
}

export const useDepartmentStore = create<DepartmentState>((set) => ({
  departments: [],
  selectedDepartment: null,
  loading: false,
  pagination: null,

  fetchDepartments: async (params) => {
    set({ loading: true })
    try {
      const result = await departmentApi.getDepartments(params)
      set({
        departments: result.data ?? [],
        pagination: result.pagination ?? null,
        loading: false,
      })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  fetchDepartment: async (id) => {
    set({ loading: true })
    try {
      const result = await departmentApi.getDepartment(id)
      set({ selectedDepartment: result.data, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  createDepartment: async (data) => {
    set({ loading: true })
    try {
      const result = await departmentApi.createDepartment(data)
      const department = result.data
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
      const result = await departmentApi.updateDepartment(id, data)
      const updatedDepartment = result.data
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
    set({ departments: [], selectedDepartment: null, pagination: null })
  },
}))
