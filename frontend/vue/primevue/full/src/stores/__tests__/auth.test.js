import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/authApi', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
}))

vi.mock('@/router', () => ({
  default: { push: vi.fn() },
}))

import * as authApi from '@/services/authApi'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  async function getStore() {
    const { useAuthStore } = await import('../auth')
    return useAuthStore()
  }

  describe('initAuth', () => {
    it('loads token from localStorage', async () => {
      localStorage.setItem('token', 'stored-token')
      const store = await getStore()
      expect(store.token).toBe('stored-token')
    })

    it('loads user from localStorage as parsed JSON', async () => {
      localStorage.setItem('user', JSON.stringify({ id: 1, username: 'admin' }))
      localStorage.setItem('token', 'tok')
      const store = await getStore()
      expect(store.user).toEqual({ id: 1, username: 'admin' })
    })

    it('handles invalid JSON in stored user gracefully', async () => {
      localStorage.setItem('user', 'not-json')
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const store = await getStore()
      expect(store.user).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('login', () => {
    it('sets token and user on success', async () => {
      const mockResponse = {
        token: 'new-token',
        user: { id: 1, username: 'admin' },
        refreshToken: 'refresh-tok',
        refreshTokenExpiresAt: '2099-01-01',
      }
      vi.mocked(authApi.login).mockResolvedValue(mockResponse)

      const store = await getStore()
      await store.login({ username: 'admin', password: 'pass' })

      expect(store.token).toBe('new-token')
      expect(store.user).toEqual({ id: 1, username: 'admin' })
      expect(store.refreshToken).toBe('refresh-tok')
    })

    it('stores data in localStorage on success', async () => {
      const mockResponse = {
        token: 'new-token',
        user: { id: 1, username: 'admin' },
        refreshToken: 'refresh-tok',
        refreshTokenExpiresAt: '2099-01-01',
      }
      vi.mocked(authApi.login).mockResolvedValue(mockResponse)

      const store = await getStore()
      await store.login({ username: 'admin', password: 'pass' })

      expect(localStorage.getItem('token')).toBe('new-token')
      expect(localStorage.getItem('refreshToken')).toBe('refresh-tok')
    })

    it('throws and sets loading false on failure', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid'))

      const store = await getStore()
      await expect(store.login({ username: 'bad', password: 'bad' })).rejects.toThrow()
      expect(store.loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('clears all auth state and localStorage', async () => {
      localStorage.setItem('token', 'tok')
      localStorage.setItem('user', '{}')
      localStorage.setItem('refreshToken', 'rt')
      vi.mocked(authApi.logout).mockResolvedValue(undefined)

      const store = await getStore()
      await store.logout()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.refreshToken).toBeNull()
      expect(localStorage.getItem('token')).toBeNull()
    })
  })

  describe('refreshTokens', () => {
    it('returns false when no refreshToken exists', async () => {
      const store = await getStore()
      const result = await store.refreshTokens()
      expect(result).toBe(false)
    })

    it('returns false when refresh token is expired', async () => {
      localStorage.setItem('refreshToken', 'rt')
      localStorage.setItem('refreshTokenExpiresAt', '2000-01-01T00:00:00Z')

      const store = await getStore()
      const result = await store.refreshTokens()
      expect(result).toBe(false)
    })

    it('updates tokens on success', async () => {
      localStorage.setItem('refreshToken', 'rt')
      localStorage.setItem('refreshTokenExpiresAt', '2099-01-01T00:00:00Z')

      vi.mocked(authApi.refreshToken).mockResolvedValue({
        token: 'new-access',
        refreshToken: 'new-refresh',
        refreshTokenExpiresAt: '2099-02-01',
        user: { id: 1, username: 'admin' },
      })

      const store = await getStore()
      const result = await store.refreshTokens()
      expect(result).toBe(true)
      expect(store.token).toBe('new-access')
      expect(store.refreshToken).toBe('new-refresh')
    })
  })

  describe('clearAuth', () => {
    it('resets all state values and clears localStorage', async () => {
      localStorage.setItem('token', 'tok')
      localStorage.setItem('user', '{}')

      const store = await getStore()
      store.clearAuth()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.refreshToken).toBeNull()
      expect(store.refreshTokenExpiresAt).toBeNull()
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('returns true when token exists', async () => {
      localStorage.setItem('token', 'tok')
      const store = await getStore()
      expect(store.isAuthenticated).toBe(true)
    })

    it('returns false when no token', async () => {
      const store = await getStore()
      expect(store.isAuthenticated).toBe(false)
    })
  })
})
