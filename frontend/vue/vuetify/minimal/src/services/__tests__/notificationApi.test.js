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
import notificationApi from '../notificationApi'

describe('Notification API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getMyNotifications calls api.get with params', () => {
    const params = { limit: 15 }
    vi.mocked(api.get).mockResolvedValue({ data: { items: [] } })

    notificationApi.getMyNotifications(params)

    expect(api.get).toHaveBeenCalledWith('/notifications', { params })
  })

  it('markAsRead calls api.put with notification id', () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })

    notificationApi.markAsRead(5)

    expect(api.put).toHaveBeenCalledWith('/notifications/5/read')
  })

  it('markAllAsRead calls api.put', () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })

    notificationApi.markAllAsRead()

    expect(api.put).toHaveBeenCalledWith('/notifications/read-all')
  })
})
