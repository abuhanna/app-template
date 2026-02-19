import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginCredentials, AuthResponse } from '@/types'
import * as authApi from '@/services/authApi'
import { useNotificationStore } from './notificationStore'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  refreshTokenExpiresAt: string | null
  loading: boolean
  isRefreshing: boolean

  // Computed
  isAuthenticated: () => boolean
  isAdmin: () => boolean

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshTokens: () => Promise<boolean>
  clearAuth: () => void
  setAuthData: (data: AuthResponse) => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      loading: false,
      isRefreshing: false,

      isAuthenticated: () => !!get().token,

      isAdmin: () => get().user?.role === 'Admin',

      login: async (credentials) => {
        set({ loading: true })
        const notification = useNotificationStore.getState()

        try {
          const response = await authApi.login(credentials)
          set({
            token: response.token,
            user: response.user,
            refreshToken: response.refreshToken,
            refreshTokenExpiresAt: response.refreshTokenExpiresAt,
            loading: false,
          })
          notification.showSuccess('Login successful!')
        } catch (error) {
          set({ loading: false })
          const message =
            error instanceof Error ? error.message : 'Login failed'
          notification.showError(message)
          throw error
        }
      },

      logout: async () => {
        set({ loading: true })
        const notification = useNotificationStore.getState()

        try {
          await authApi.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          get().clearAuth()
          notification.showInfo('Logged out successfully')
          set({ loading: false })
        }
      },

      refreshTokens: async () => {
        const state = get()
        if (!state.refreshToken || state.isRefreshing) return false

        if (state.refreshTokenExpiresAt) {
          const expiresAt = new Date(state.refreshTokenExpiresAt)
          if (expiresAt <= new Date()) return false
        }

        set({ isRefreshing: true })

        try {
          const response = await authApi.refreshToken(state.refreshToken)
          set({
            token: response.token,
            refreshToken: response.refreshToken,
            refreshTokenExpiresAt: response.refreshTokenExpiresAt,
            user: response.user,
            isRefreshing: false,
          })
          return true
        } catch (error) {
          console.error('Failed to refresh token:', error)
          set({ isRefreshing: false })
          return false
        }
      },

      clearAuth: () => {
        set({
          token: null,
          user: null,
          refreshToken: null,
          refreshTokenExpiresAt: null,
        })
      },

      setAuthData: (data) => {
        set({
          token: data.token,
          user: data.user,
          refreshToken: data.refreshToken,
          refreshTokenExpiresAt: data.refreshTokenExpiresAt,
        })
      },

      setUser: (user) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        refreshToken: state.refreshToken,
        refreshTokenExpiresAt: state.refreshTokenExpiresAt,
      }),
    }
  )
)
