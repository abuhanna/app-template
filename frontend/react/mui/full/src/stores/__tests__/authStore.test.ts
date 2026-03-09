import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/services/authApi', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
}))

vi.mock('@/stores/notificationStore', () => ({
  useNotificationStore: {
    getState: () => ({
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showInfo: vi.fn(),
      showWarning: vi.fn(),
    }),
  },
}))

import * as authApi from '@/services/authApi'
import { useAuthStore } from '../authStore'

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      loading: false,
      isRefreshing: false,
    })
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('sets token and user on success', async () => {
      const mockResponse = {
        success: true,
        message: 'Login successful',
        data: {
          accessToken: 'new-token',
          refreshToken: 'refresh-tok',
          expiresIn: 900,
          user: { id: 1, username: 'admin', email: 'admin@test.com', role: 'admin', isActive: true },
        },
      }
      vi.mocked(authApi.login).mockResolvedValue(mockResponse as any)

      await useAuthStore.getState().login({ username: 'admin', password: 'pass' })

      const state = useAuthStore.getState()
      expect(state.token).toBe('new-token')
      expect(state.user?.username).toBe('admin')
      expect(state.refreshToken).toBe('refresh-tok')
    })

    it('sets loading to false after completion', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: true,
        message: 'Login successful',
        data: {
          accessToken: 't',
          refreshToken: 'r',
          expiresIn: 900,
          user: { id: 1, username: 'u', email: 'e', role: 'user', isActive: true },
        },
      } as any)

      await useAuthStore.getState().login({ username: 'u', password: 'p' })
      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('throws on failure and sets loading false', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid'))

      await expect(
        useAuthStore.getState().login({ username: 'bad', password: 'bad' })
      ).rejects.toThrow()
      expect(useAuthStore.getState().loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('clears auth state', async () => {
      useAuthStore.setState({ token: 'tok', user: { id: 1 } as any, refreshToken: 'rt' })
      vi.mocked(authApi.logout).mockResolvedValue(undefined as any)

      await useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.token).toBeNull()
      expect(state.user).toBeNull()
      expect(state.refreshToken).toBeNull()
    })

    it('calls authApi.logout', async () => {
      vi.mocked(authApi.logout).mockResolvedValue(undefined as any)
      await useAuthStore.getState().logout()
      expect(authApi.logout).toHaveBeenCalled()
    })
  })

  describe('refreshTokens', () => {
    it('returns false when no refresh token', async () => {
      const result = await useAuthStore.getState().refreshTokens()
      expect(result).toBe(false)
    })

    it('returns true and updates tokens on success', async () => {
      useAuthStore.setState({
        refreshToken: 'rt',
      })
      vi.mocked(authApi.refreshToken).mockResolvedValue({
        success: true,
        message: 'Token refreshed',
        data: {
          accessToken: 'new-access',
          refreshToken: 'new-refresh',
          expiresIn: 900,
        },
      } as any)

      const result = await useAuthStore.getState().refreshTokens()
      expect(result).toBe(true)
      expect(useAuthStore.getState().token).toBe('new-access')
      expect(useAuthStore.getState().refreshToken).toBe('new-refresh')
    })
  })

  describe('clearAuth', () => {
    it('resets all auth state to null', () => {
      useAuthStore.setState({
        token: 'tok',
        user: { id: 1 } as any,
        refreshToken: 'rt',
      })

      useAuthStore.getState().clearAuth()

      const state = useAuthStore.getState()
      expect(state.token).toBeNull()
      expect(state.user).toBeNull()
      expect(state.refreshToken).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('returns true when token exists', () => {
      useAuthStore.setState({ token: 'tok' })
      expect(useAuthStore.getState().isAuthenticated()).toBe(true)
    })

    it('returns false when no token', () => {
      expect(useAuthStore.getState().isAuthenticated()).toBe(false)
    })
  })

  describe('isAdmin', () => {
    it('returns true when user role is admin', () => {
      useAuthStore.setState({ user: { id: 1, role: 'admin' } as any })
      expect(useAuthStore.getState().isAdmin()).toBe(true)
    })

    it('returns false when user role is not admin', () => {
      useAuthStore.setState({ user: { id: 1, role: 'user' } as any })
      expect(useAuthStore.getState().isAdmin()).toBe(false)
    })
  })
})
