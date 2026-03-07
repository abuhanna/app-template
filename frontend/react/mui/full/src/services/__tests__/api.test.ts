import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/router', () => ({
  router: { navigate: vi.fn() },
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      token: null,
      refreshTokens: vi.fn(),
      clearAuth: vi.fn(),
    })),
  },
}))

vi.mock('@/stores/notificationStore', () => ({
  useNotificationStore: {
    getState: () => ({
      showError: vi.fn(),
      showSuccess: vi.fn(),
      showInfo: vi.fn(),
    }),
  },
}))

import api from '../api'
import { useAuthStore } from '@/stores/authStore'

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates axios instance with correct baseURL', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:5100/api')
  })

  it('sets Content-Type header to application/json', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json')
  })

  it('request interceptor adds Bearer token from auth store', () => {
    vi.mocked(useAuthStore.getState).mockReturnValue({
      token: 'my-jwt-token',
      refreshTokens: vi.fn(),
      clearAuth: vi.fn(),
    } as any)

    const config = { headers: {} } as any
    const interceptor = (api.interceptors.request as any).handlers[0]
    const result = interceptor.fulfilled(config)

    expect(result.headers.Authorization).toBe('Bearer my-jwt-token')
  })

  it('request interceptor skips token when store has no token', () => {
    vi.mocked(useAuthStore.getState).mockReturnValue({
      token: null,
      refreshTokens: vi.fn(),
      clearAuth: vi.fn(),
    } as any)

    const config = { headers: {} } as any
    const interceptor = (api.interceptors.request as any).handlers[0]
    const result = interceptor.fulfilled(config)

    expect(result.headers.Authorization).toBeUndefined()
  })
})
