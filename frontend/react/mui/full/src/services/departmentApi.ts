import api from './api'
import type {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  ApiResponse,
  SortDirection,
} from '@/types'

export interface GetDepartmentsParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: SortDirection
  search?: string
  isActive?: boolean
}

export async function getDepartments(
  params: GetDepartmentsParams = {}
): Promise<ApiResponse<Department[]>> {
  const response = await api.get<ApiResponse<Department[]>>('/departments', { params })
  return response.data
}

export async function getDepartment(id: number): Promise<ApiResponse<Department>> {
  const response = await api.get<ApiResponse<Department>>(`/departments/${id}`)
  return response.data
}

export async function createDepartment(data: CreateDepartmentRequest): Promise<ApiResponse<Department>> {
  const response = await api.post<ApiResponse<Department>>('/departments', data)
  return response.data
}

export async function updateDepartment(
  id: number,
  data: UpdateDepartmentRequest
): Promise<ApiResponse<Department>> {
  const response = await api.put<ApiResponse<Department>>(`/departments/${id}`, data)
  return response.data
}

export async function deleteDepartment(id: number): Promise<void> {
  await api.delete(`/departments/${id}`)
}

export const departmentApi = {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
}
