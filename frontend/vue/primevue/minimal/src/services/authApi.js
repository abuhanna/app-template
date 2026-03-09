// src/services/authApi.js
import api from './api'

export async function login (credentials) {
  const response = await api.post('/auth/login', credentials)
  return response.data
}

export async function logout () {
  const response = await api.post('/auth/logout')
  return response.data
}

export async function getProfile () {
  const response = await api.get('/auth/profile')
  return response.data
}

export async function updateProfile (data) {
  const response = await api.put('/auth/profile', data)
  return response.data
}

export async function forgotPassword (email) {
  const response = await api.post('/auth/forgot-password', { email })
  return response.data
}

export async function resetPassword (data) {
  const response = await api.post('/auth/reset-password', data)
  return response.data
}

export async function refreshToken (token) {
  const response = await api.post('/auth/refresh', { refreshToken: token })
  return response.data
}

export async function changePassword (data) {
  const response = await api.post('/auth/change-password', data)
  return response.data
}

// Default export for convenience
export default {
  login,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  refreshToken,
  changePassword,
}
