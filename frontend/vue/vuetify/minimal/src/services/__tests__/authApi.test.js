import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from '../api'
import {
  forgotPassword,
  getProfile,
  login,
  logout,
  refreshToken,
  resetPassword,
  updateProfile,
} from '../authApi'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Auth API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('login calls api.post with credentials', async () => {
    const credentials = { username: 'admin', password: 'Admin@123' }
    const mockData = { token: 'jwt-token', user: { id: 1 } }
    vi.mocked(api.post).mockResolvedValue({ data: mockData })

    const result = await login(credentials)

    expect(api.post).toHaveBeenCalledWith('/auth/login', credentials)
    expect(result).toEqual(mockData)
  })

  it('logout calls api.post', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} })

    const result = await logout()

    expect(api.post).toHaveBeenCalledWith('/auth/logout')
    expect(result).toEqual({})
  })

  it('getProfile calls api.get', async () => {
    const mockProfile = { id: 1, username: 'admin', email: 'admin@test.com' }
    vi.mocked(api.get).mockResolvedValue({ data: mockProfile })

    const result = await getProfile()

    expect(api.get).toHaveBeenCalledWith('/auth/profile')
    expect(result).toEqual(mockProfile)
  })

  it('updateProfile calls api.put with data', async () => {
    const profileData = { email: 'new@test.com' }
    vi.mocked(api.put).mockResolvedValue({ data: profileData })

    const result = await updateProfile(profileData)

    expect(api.put).toHaveBeenCalledWith('/auth/profile', profileData)
    expect(result).toEqual(profileData)
  })

  it('forgotPassword calls api.post with email', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'sent' } })

    const result = await forgotPassword('user@test.com')

    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'user@test.com' })
    expect(result).toEqual({ message: 'sent' })
  })

  it('resetPassword calls api.post with token and passwords', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'reset' } })

    const result = await resetPassword('reset-token', 'newPass', 'newPass')

    expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'reset-token',
      newPassword: 'newPass',
      confirmPassword: 'newPass',
    })
    expect(result).toEqual({ message: 'reset' })
  })

  it('refreshToken calls api.post with refreshToken', async () => {
    const mockData = { token: 'new-jwt', refreshToken: 'new-refresh' }
    vi.mocked(api.post).mockResolvedValue({ data: mockData })

    const result = await refreshToken('old-refresh-token')

    expect(api.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'old-refresh-token' })
    expect(result).toEqual(mockData)
  })
})
