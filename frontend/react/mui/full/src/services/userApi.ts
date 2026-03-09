import api from './api'
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ApiResponse,
  SortDirection,
} from '@/types'

export interface GetUsersParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: SortDirection
  search?: string
  isActive?: boolean
  departmentId?: number
}

export async function getUsers(params: GetUsersParams = {}): Promise<ApiResponse<User[]>> {
  const response = await api.get<ApiResponse<User[]>>('/users', { params })
  return response.data
}

export async function getUser(id: number): Promise<ApiResponse<User>> {
  const response = await api.get<ApiResponse<User>>(`/users/${id}`)
  return response.data
}

export async function createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
  const response = await api.post<ApiResponse<User>>('/users', data)
  return response.data
}

export async function updateUser(id: number, data: UpdateUserRequest): Promise<ApiResponse<User>> {
  const response = await api.put<ApiResponse<User>>(`/users/${id}`, data)
  return response.data
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`)
}

export const userApi = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
}
