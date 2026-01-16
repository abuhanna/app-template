import api from './api'
import type {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentListResponse,
} from '@/types'

export async function getDepartments(params?: {
  page?: number
  pageSize?: number
  search?: string
}): Promise<DepartmentListResponse> {
  const response = await api.get<DepartmentListResponse>('/departments', { params })
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
