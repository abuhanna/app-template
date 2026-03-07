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
      refreshTokenExpiresAt: null,
      loading: false,
      isRefreshing: false,
    })
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('sets token and user on success', async () => {
      const mockResponse = {
        token: 'new-token',
        user: { id: 1, username: 'admin', email: 'admin@test.com', role: 'Admin', isActive: true },
        refreshToken: 'refresh-tok',
        refreshTokenExpiresAt: '2099-01-01',
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
        token: 't',
        user: { id: 1, username: 'u', email: 'e', role: 'User', isActive: true },
        refreshToken: 'r',
        refreshTokenExpiresAt: '2099-01-01',
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

    it('returns false when refresh token expired', async () => {
      useAuthStore.setState({
        refreshToken: 'rt',
        refreshTokenExpiresAt: '2000-01-01T00:00:00Z',
      })
      const result = await useAuthStore.getState().refreshTokens()
      expect(result).toBe(false)
    })

    it('returns true and updates tokens on success', async () => {
      useAuthStore.setState({
        refreshToken: 'rt',
        refreshTokenExpiresAt: '2099-01-01T00:00:00Z',
      })
      vi.mocked(authApi.refreshToken).mockResolvedValue({
        token: 'new-access',
        refreshToken: 'new-refresh',
        refreshTokenExpiresAt: '2099-02-01',
        user: { id: 1, username: 'admin', email: 'e', role: 'Admin', isActive: true },
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
        refreshTokenExpiresAt: '2099-01-01',
      })

      useAuthStore.getState().clearAuth()

      const state = useAuthStore.getState()
      expect(state.token).toBeNull()
      expect(state.user).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.refreshTokenExpiresAt).toBeNull()
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
    it('returns true when user role is Admin', () => {
      useAuthStore.setState({ user: { id: 1, role: 'Admin' } as any })
      expect(useAuthStore.getState().isAdmin()).toBe(true)
    })

    it('returns false when user role is not Admin', () => {
      useAuthStore.setState({ user: { id: 1, role: 'User' } as any })
      expect(useAuthStore.getState().isAdmin()).toBe(false)
    })
  })
})
