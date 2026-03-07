import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '../api'
import { login, logout, getProfile, updateProfile, refreshToken, forgotPassword, resetPassword, changePassword } from '../authApi'

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('posts credentials to /auth/login', async () => {
      const mockResponse = { data: { token: 'tok', user: { id: 1 }, refreshToken: 'rt', refreshTokenExpiresAt: '2099-01-01' } }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await login({ username: 'admin', password: 'pass' } as any)

      expect(api.post).toHaveBeenCalledWith('/auth/login', { username: 'admin', password: 'pass' })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('logout', () => {
    it('posts to /auth/logout', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await logout()

      expect(api.post).toHaveBeenCalledWith('/auth/logout')
    })
  })

  describe('getProfile', () => {
    it('gets from /auth/profile', async () => {
      const mockUser = { id: 1, username: 'admin' }
      vi.mocked(api.get).mockResolvedValue({ data: mockUser })

      const result = await getProfile()

      expect(api.get).toHaveBeenCalledWith('/auth/profile')
      expect(result).toEqual(mockUser)
    })
  })

  describe('updateProfile', () => {
    it('puts to /auth/profile', async () => {
      const data = { username: 'updated' }
      const mockUser = { id: 1, username: 'updated' }
      vi.mocked(api.put).mockResolvedValue({ data: mockUser })

      const result = await updateProfile(data as any)

      expect(api.put).toHaveBeenCalledWith('/auth/profile', data)
      expect(result).toEqual(mockUser)
    })
  })

  describe('refreshToken', () => {
    it('posts to /auth/refresh with token', async () => {
      const mockResponse = { data: { token: 'new-tok', refreshToken: 'new-rt' } }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await refreshToken('old-rt')

      expect(api.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'old-rt' })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('forgotPassword', () => {
    it('posts to /auth/forgot-password with email', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await forgotPassword('user@test.com')

      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'user@test.com' })
    })
  })

  describe('resetPassword', () => {
    it('posts to /auth/reset-password with token and newPassword', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await resetPassword('reset-tok', 'NewPass@123')

      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', { token: 'reset-tok', newPassword: 'NewPass@123' })
    })
  })

  describe('changePassword', () => {
    it('posts to /auth/change-password with current and new password', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await changePassword('OldPass@123', 'NewPass@123')

      expect(api.post).toHaveBeenCalledWith('/auth/change-password', { currentPassword: 'OldPass@123', newPassword: 'NewPass@123' })
    })
  })
})
