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

export async function refreshToken (token) {
  const response = await api.post('/auth/refresh', { refreshToken: token })
  return response.data
}

// Default export for convenience
export default {
  login,
  logout,
  refreshToken,
}
