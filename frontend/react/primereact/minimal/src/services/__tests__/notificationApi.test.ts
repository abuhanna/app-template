import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '../api'
import { getMyNotifications, markAsRead, markAllAsRead } from '../notificationApi'

describe('Notification API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMyNotifications', () => {
    it('gets from /notifications with params', async () => {
      const mockData = { data: [], total: 0, unreadCount: 0 }
      vi.mocked(api.get).mockResolvedValue({ data: mockData })

      const result = await getMyNotifications({ limit: 15 })

      expect(api.get).toHaveBeenCalledWith('/notifications', { params: { limit: 15 } })
      expect(result).toEqual(mockData)
    })
  })

  describe('markAsRead', () => {
    it('patches /notifications/:id/read', async () => {
      vi.mocked(api.patch).mockResolvedValue({})

      await markAsRead('abc-123')

      expect(api.patch).toHaveBeenCalledWith('/notifications/abc-123/read')
    })
  })

  describe('markAllAsRead', () => {
    it('patches /notifications/read-all', async () => {
      vi.mocked(api.patch).mockResolvedValue({})

      await markAllAsRead()

      expect(api.patch).toHaveBeenCalledWith('/notifications/read-all')
    })
  })
})
