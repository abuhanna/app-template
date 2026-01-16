import api from './api'
import type { User, CreateUserRequest, UpdateUserRequest, UserListResponse } from '@/types'

export async function getUsers(params?: {
  page?: number
  pageSize?: number
  search?: string
}): Promise<UserListResponse> {
  const response = await api.get<UserListResponse>('/users', { params })
  return response.data
}

export async function getUser(id: string): Promise<User> {
  const response = await api.get<User>(`/users/${id}`)
  return response.data
}

export async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await api.post<User>('/users', data)
  return response.data
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<User> {
  const response = await api.put<User>(`/users/${id}`, data)
  return response.data
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`)
}

export async function getMyProfile(): Promise<User> {
  const response = await api.get<User>('/users/me')
  return response.data
}

export async function updateMyProfile(data: UpdateUserRequest): Promise<User> {
  const response = await api.put<User>('/users/me', data)
  return response.data
}

export const userApi = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMyProfile,
  updateMyProfile,
}
