import { beforeEach, describe, expect, it, vi } from 'vitest'

// We test the api module by importing it and checking interceptor behavior
// Since the interceptors are set up at import time, we test via the axios instance
import api from '../api'

vi.mock('@/router', () => ({
  default: {
    push: vi.fn(),
    currentRoute: { value: { fullPath: '/dashboard' } },
  },
}))

describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('creates axios instance with correct baseURL', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:5100/api')
  })

  it('sets Content-Type header to application/json', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json')
  })

  it('request interceptor adds Bearer token from localStorage', async () => {
    localStorage.setItem('token', 'my-jwt-token')

    // Create a mock config and run it through the interceptor
    const config = { headers: {} }
    // Access the request interceptor - it's the first one
    const interceptor = api.interceptors.request.handlers[0]
    const result = interceptor.fulfilled(config)

    expect(result.headers.Authorization).toBe('Bearer my-jwt-token')
  })

  it('request interceptor does not add token when not in localStorage', async () => {
    const config = { headers: {} }
    const interceptor = api.interceptors.request.handlers[0]
    const result = interceptor.fulfilled(config)

    expect(result.headers.Authorization).toBeUndefined()
  })
})
