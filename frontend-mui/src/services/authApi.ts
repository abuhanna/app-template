import api from './api'
import type { LoginCredentials, AuthResponse } from '@/types'

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', credentials)
  return response.data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
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

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await api.post('/auth/reset-password', { token, newPassword })
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.post('/auth/change-password', { currentPassword, newPassword })
}

export const authApi = {
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
}
