import api from './api'
import type { LoginCredentials, AuthResponse } from '@/types'
import type { ApiResponse } from '@/types/pagination'
import type { User } from '@/types/auth'

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', credentials)
  return response.data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export async function getProfile(): Promise<ApiResponse<User>> {
  const response = await api.get<ApiResponse<User>>('/auth/profile')
  return response.data
}

export async function updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
  const response = await api.put<ApiResponse<User>>('/auth/profile', data)
  return response.data
}

export async function refreshToken(token: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/refresh', {
    refreshToken: token,
  })
  return response.data
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email })
}

export async function resetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<void> {
  await api.post('/auth/reset-password', { token, newPassword, confirmPassword })
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<void> {
  await api.post('/auth/change-password', { currentPassword, newPassword, confirmPassword })
}

export const authApi = {
  login,
  logout,
  getProfile,
  updateProfile,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
}
