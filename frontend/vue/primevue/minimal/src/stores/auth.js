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
  const loading = ref(false)
  const isRefreshing = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  // Initialize auth state from localStorage
  const initAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    const storedRefreshToken = localStorage.getItem('refreshToken')

    if (storedToken) {
      token.value = storedToken
    }

    if (storedRefreshToken) {
      refreshToken.value = storedRefreshToken
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

      // Store token and user data from envelope
      token.value = response.data.accessToken
      user.value = response.data.user
      refreshToken.value = response.data.refreshToken

      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken)
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

    isRefreshing.value = true

    try {
      const response = await authApi.refreshToken(refreshToken.value)

      // Update tokens from envelope (no user object on refresh)
      token.value = response.data.accessToken
      refreshToken.value = response.data.refreshToken

      localStorage.setItem('token', token.value)
      localStorage.setItem('refreshToken', response.data.refreshToken)

      if (import.meta.env.DEV) {
        console.log('Token refreshed successfully')
      }
      return true
    } catch (error_) {
      console.error('Failed to refresh token:', error_)
      return false
    } finally {
      isRefreshing.value = false
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await authApi.getProfile()
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
    } catch (error_) {
      console.error('Failed to fetch profile:', error_)
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
    loading,
    isAuthenticated,
    isRefreshing,
    login,
    logout,
    refreshTokens,
    fetchProfile,
    clearAuth,
    initAuth,
  }
})
