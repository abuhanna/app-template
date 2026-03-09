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
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../notificationApi'

describe('Notification API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMyNotifications', () => {
    it('gets from /notifications with params', async () => {
      const mockData = { success: true, data: [], pagination: { totalItems: 0 } }
      vi.mocked(api.get).mockResolvedValue({ data: mockData })

      const result = await getMyNotifications({ page: 1, pageSize: 15 })

      expect(api.get).toHaveBeenCalledWith('/notifications', { params: { page: 1, pageSize: 15 } })
      expect(result).toEqual(mockData)
    })
  })

  describe('getUnreadCount', () => {
    it('gets from /notifications/unread-count', async () => {
      const mockData = { success: true, data: { count: 5 } }
      vi.mocked(api.get).mockResolvedValue({ data: mockData })

      const result = await getUnreadCount()

      expect(api.get).toHaveBeenCalledWith('/notifications/unread-count')
      expect(result).toEqual(mockData)
    })
  })

  describe('markAsRead', () => {
    it('puts /notifications/:id/read', async () => {
      vi.mocked(api.put).mockResolvedValue({})

      await markAsRead(1)

      expect(api.put).toHaveBeenCalledWith('/notifications/1/read')
    })
  })

  describe('markAllAsRead', () => {
    it('puts /notifications/read-all', async () => {
      vi.mocked(api.put).mockResolvedValue({})

      await markAllAsRead()

      expect(api.put).toHaveBeenCalledWith('/notifications/read-all')
    })
  })

  describe('deleteNotification', () => {
    it('deletes /notifications/:id', async () => {
      vi.mocked(api.delete).mockResolvedValue({})

      await deleteNotification(1)

      expect(api.delete).toHaveBeenCalledWith('/notifications/1')
    })
  })
})
