import api from './api'
import type {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  PagedResult,
  SortDirection,
} from '@/types'

export interface GetDepartmentsParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortDir?: SortDirection
  search?: string
  isActive?: boolean
}

export async function getDepartments(
  params: GetDepartmentsParams = {}
): Promise<PagedResult<Department>> {
  const response = await api.get<PagedResult<Department>>('/departments', { params })
  return response.data
}

export async function getDepartment(id: string): Promise<Department> {
  const response = await api.get<Department>(`/departments/${id}`)
  return response.data
}

export async function createDepartment(data: CreateDepartmentRequest): Promise<Department> {
  const response = await api.post<Department>('/departments', data)
  return response.data
}

export async function updateDepartment(
  id: string,
  data: UpdateDepartmentRequest
): Promise<Department> {
  const response = await api.put<Department>(`/departments/${id}`, data)
  return response.data
}

export async function deleteDepartment(id: string): Promise<void> {
  await api.delete(`/departments/${id}`)
}

export const departmentApi = {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
}
