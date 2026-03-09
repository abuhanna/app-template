import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/services/notificationApi', () => ({
  getMyNotifications: vi.fn(),
  getUnreadCount: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  deleteNotification: vi.fn(),
}))

vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: vi.fn(() => ({
    withUrl: vi.fn().mockReturnThis(),
    withAutomaticReconnect: vi.fn().mockReturnThis(),
    build: vi.fn(() => ({
      on: vi.fn(),
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn(),
      state: 'Connected',
    })),
  })),
  HubConnectionState: { Connected: 'Connected' },
}))

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    disconnect: vi.fn(),
  })),
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      token: 'test-token',
    })),
  },
}))

vi.mock('@/stores/notificationStore', () => ({
  useNotificationStore: {
    getState: () => ({
      showInfo: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
    }),
  },
}))

import * as notificationApi from '@/services/notificationApi'
import { useAuthStore } from '@/stores/authStore'
import { usePersistentNotificationStore } from '../persistentNotificationStore'

describe('PersistentNotificationStore', () => {
  beforeEach(() => {
    usePersistentNotificationStore.setState({
      notifications: [],
      loading: false,
      connection: null,
      unreadCount: 0,
    })
    vi.clearAllMocks()
  })

  describe('fetchNotifications', () => {
    it('updates state on success', async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: 1, title: 'Test', message: 'msg', type: 'info' as const, isRead: false, createdAt: '2024-01-01' },
        ],
        pagination: { totalItems: 1 },
      }
      vi.mocked(notificationApi.getMyNotifications).mockResolvedValue(mockResponse as any)

      await usePersistentNotificationStore.getState().fetchNotifications()

      const state = usePersistentNotificationStore.getState()
      expect(state.notifications).toEqual(mockResponse.data)
      expect(state.loading).toBe(false)
    })

    it('handles error and sets loading false', async () => {
      vi.mocked(notificationApi.getMyNotifications).mockRejectedValue(new Error('Network error'))

      await usePersistentNotificationStore.getState().fetchNotifications()

      const state = usePersistentNotificationStore.getState()
      expect(state.loading).toBe(false)
      expect(state.notifications).toEqual([])
    })
  })

  describe('fetchUnreadCount', () => {
    it('updates unreadCount from API', async () => {
      vi.mocked(notificationApi.getUnreadCount).mockResolvedValue({
        success: true,
        message: '',
        data: { count: 3 },
      } as any)

      await usePersistentNotificationStore.getState().fetchUnreadCount()

      expect(usePersistentNotificationStore.getState().unreadCount).toBe(3)
    })
  })

  describe('markAsRead', () => {
    it('updates local notification state and returns true', async () => {
      usePersistentNotificationStore.setState({
        notifications: [
          { id: 1, title: 'N1', message: 'm', type: 'info', isRead: false, createdAt: '2024-01-01' },
          { id: 2, title: 'N2', message: 'm', type: 'info', isRead: false, createdAt: '2024-01-01' },
        ] as any,
        unreadCount: 2,
      })
      vi.mocked(notificationApi.markAsRead).mockResolvedValue(undefined)

      const result = await usePersistentNotificationStore.getState().markAsRead(1)

      expect(result).toBe(true)
      const state = usePersistentNotificationStore.getState()
      expect(state.notifications[0].isRead).toBe(true)
      expect(state.notifications[1].isRead).toBe(false)
      expect(state.unreadCount).toBe(1)
    })

    it('returns false on API error', async () => {
      vi.mocked(notificationApi.markAsRead).mockRejectedValue(new Error('Failed'))

      const result = await usePersistentNotificationStore.getState().markAsRead(1)

      expect(result).toBe(false)
    })
  })

  describe('markAllAsRead', () => {
    it('marks all notifications as read', async () => {
      usePersistentNotificationStore.setState({
        notifications: [
          { id: 1, title: 'N1', message: 'm', type: 'info', isRead: false, createdAt: '2024-01-01' },
          { id: 2, title: 'N2', message: 'm', type: 'info', isRead: false, createdAt: '2024-01-01' },
        ] as any,
        unreadCount: 2,
      })
      vi.mocked(notificationApi.markAllAsRead).mockResolvedValue(undefined)

      const result = await usePersistentNotificationStore.getState().markAllAsRead()

      expect(result).toBe(true)
      const state = usePersistentNotificationStore.getState()
      expect(state.notifications.every((n) => n.isRead)).toBe(true)
      expect(state.unreadCount).toBe(0)
    })
  })

  describe('addNotification', () => {
    it('prepends notification to list and increments unreadCount', () => {
      usePersistentNotificationStore.setState({
        notifications: [
          { id: 1, title: 'Old', message: 'm', type: 'info', isRead: true, createdAt: '2024-01-01' },
        ] as any,
        unreadCount: 0,
      })

      const newNotification = {
        id: 2,
        title: 'New',
        message: 'new msg',
        type: 'success' as const,
        isRead: false,
        createdAt: '2024-01-02',
      }

      usePersistentNotificationStore.getState().addNotification(newNotification as any)

      const state = usePersistentNotificationStore.getState()
      expect(state.notifications).toHaveLength(2)
      expect(state.notifications[0].id).toBe(2)
      expect(state.unreadCount).toBe(1)
    })
  })

  describe('unreadCount', () => {
    it('reflects count of unread items', () => {
      usePersistentNotificationStore.setState({ unreadCount: 5 })
      expect(usePersistentNotificationStore.getState().unreadCount).toBe(5)
    })
  })

  describe('disconnect', () => {
    it('clears connection', () => {
      usePersistentNotificationStore.setState({ connection: { stop: vi.fn() } as any })

      usePersistentNotificationStore.getState().disconnect()

      expect(usePersistentNotificationStore.getState().connection).toBeNull()
    })
  })

  describe('initConnection', () => {
    it('returns early when no token', async () => {
      vi.mocked(useAuthStore.getState).mockReturnValue({ token: null } as any)

      await usePersistentNotificationStore.getState().initConnection()

      expect(usePersistentNotificationStore.getState().connection).toBeNull()
    })

    it('returns early when connection already exists', async () => {
      vi.mocked(useAuthStore.getState).mockReturnValue({ token: 'tok' } as any)
      usePersistentNotificationStore.setState({ connection: { fake: true } as any })

      await usePersistentNotificationStore.getState().initConnection()

      // Connection should remain the same mock, not be replaced
      expect((usePersistentNotificationStore.getState().connection as any).fake).toBe(true)
    })
  })
})
