// src/stores/auth.js
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import router from '@/router'
import * as authApi from '@/services/authApi'
import { useNotificationStore } from './notification'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const refreshToken = ref(null)
  const refreshTokenExpiresAt = ref(null)
  const loading = ref(false)
  const isRefreshing = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  // Initialize auth state from localStorage
  const initAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    const storedRefreshTokenExpiresAt = localStorage.getItem('refreshTokenExpiresAt')

    if (storedToken) {
      token.value = storedToken
    }

    if (storedRefreshToken) {
      refreshToken.value = storedRefreshToken
    }

    if (storedRefreshTokenExpiresAt) {
      refreshTokenExpiresAt.value = storedRefreshTokenExpiresAt
    }

    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (error_) {
        console.error('Error parsing stored user:', error_)
        localStorage.removeItem('user')
      }
    }
  }

  const login = async credentials => {
    loading.value = true
    const notificationStore = useNotificationStore()

    try {
      const response = await authApi.login(credentials)

      // Store token and user data
      token.value = response.token || response.accessToken
      user.value = response.user
      refreshToken.value = response.refreshToken
      refreshTokenExpiresAt.value = response.refreshTokenExpiresAt

      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken)
        localStorage.setItem('refreshTokenExpiresAt', response.refreshTokenExpiresAt)
      }

      notificationStore.showSuccess('Login successful!')
      loading.value = false
      return response
    } catch (error_) {
      const errorMessage = error_.response?.data?.message || 'Login failed'
      notificationStore.showError(errorMessage)
      loading.value = false
      throw error_
    }
  }

  const refreshTokens = async () => {
    if (!refreshToken.value || isRefreshing.value) {
      return false
    }

    // Check if refresh token has expired
    if (refreshTokenExpiresAt.value) {
      const expiresAt = new Date(refreshTokenExpiresAt.value)
      if (expiresAt <= new Date()) {
        if (import.meta.env.DEV) console.log('Refresh token has expired')
        return false
      }
    }

    isRefreshing.value = true

    try {
      const response = await authApi.refreshToken(refreshToken.value)

      // Update tokens
      token.value = response.token
      refreshToken.value = response.refreshToken
      refreshTokenExpiresAt.value = response.refreshTokenExpiresAt
      user.value = response.user

      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('refreshTokenExpiresAt', response.refreshTokenExpiresAt)

      if (import.meta.env.DEV) console.log('Token refreshed successfully')
      return true
    } catch (error_) {
      console.error('Failed to refresh token:', error_)
      return false
    } finally {
      isRefreshing.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    const notificationStore = useNotificationStore()

    try {
      await authApi.logout()
    } catch (error_) {
      console.error('Logout error:', error_)
    } finally {
      // Clear state regardless of API call result
      clearAuth()

      notificationStore.showInfo('Logged out successfully')
      loading.value = false
      router.push('/login')
    }
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    refreshToken.value = null
    refreshTokenExpiresAt.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('refreshTokenExpiresAt')
  }

  // Initialize on store creation
  initAuth()

  return {
    user,
    token,
    refreshToken,
    refreshTokenExpiresAt,
    loading,
    isAuthenticated,
    isRefreshing,
    login,
    logout,
    refreshTokens,
    clearAuth,
    initAuth,
  }
})
