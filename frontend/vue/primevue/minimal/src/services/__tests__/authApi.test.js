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
import {
  login,
  logout,
  refreshToken,
} from '../authApi'

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

  it('refreshToken calls api.post with refreshToken', async () => {
    const mockData = { token: 'new-jwt', refreshToken: 'new-refresh' }
    vi.mocked(api.post).mockResolvedValue({ data: mockData })

    const result = await refreshToken('old-refresh-token')

    expect(api.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'old-refresh-token' })
    expect(result).toEqual(mockData)
  })
})
