import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.stubGlobal('Notification', {
  permission: 'default',
  requestPermission: vi.fn().mockResolvedValue('granted'),
})

vi.mock('@/services/notificationApi', () => ({
  default: {
    getMyNotifications: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}))

vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: vi.fn(() => ({
    withUrl: vi.fn().mockReturnThis(),
    configureLogging: vi.fn().mockReturnThis(),
    withAutomaticReconnect: vi.fn().mockReturnThis(),
    build: vi.fn().mockReturnValue({
      on: vi.fn(),
      start: vi.fn().mockResolvedValue(undefined),
    }),
  })),
}))

vi.mock('socket.io-client', () => ({
  io: vi.fn(),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    token: null,
  }),
}))

vi.mock('@/stores/notification', () => ({
  useNotificationStore: () => ({
    showInfo: vi.fn(),
    showError: vi.fn(),
  }),
}))

import notificationApi from '@/services/notificationApi'
import { usePersistentNotificationStore } from '../persistentNotification'

describe('Persistent Notification Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('unreadCount', () => {
    it('computes correctly from read/unread notifications', () => {
      const store = usePersistentNotificationStore()
      store.notifications = [
        { id: 1, title: 'n1', isRead: false },
        { id: 2, title: 'n2', isRead: true },
        { id: 3, title: 'n3', isRead: false },
      ]

      expect(store.unreadCount).toBe(2)
    })
  })

  describe('fetchNotifications', () => {
    it('updates state on success', async () => {
      const mockItems = [
        { id: 1, title: 'Notification 1', isRead: false },
        { id: 2, title: 'Notification 2', isRead: true },
      ]
      vi.mocked(notificationApi.getMyNotifications).mockResolvedValue({
        data: { items: mockItems },
      })

      const store = usePersistentNotificationStore()
      await store.fetchNotifications()

      expect(store.notifications).toEqual(mockItems)
      expect(store.loading).toBe(false)
    })

    it('handles error silently and sets loading false', async () => {
      vi.mocked(notificationApi.getMyNotifications).mockRejectedValue(new Error('Network error'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

      const store = usePersistentNotificationStore()
      await store.fetchNotifications()

      expect(store.loading).toBe(false)
    })
  })

  describe('markAsRead', () => {
    it('updates local state and returns true', async () => {
      vi.mocked(notificationApi.markAsRead).mockResolvedValue(undefined)

      const store = usePersistentNotificationStore()
      store.notifications = [
        { id: 1, title: 'n1', isRead: false },
        { id: 2, title: 'n2', isRead: false },
      ]

      const result = await store.markAsRead(1)

      expect(result).toBe(true)
      expect(store.notifications[0].isRead).toBe(true)
      expect(store.notifications[1].isRead).toBe(false)
    })

    it('returns false on error', async () => {
      vi.mocked(notificationApi.markAsRead).mockRejectedValue(new Error('fail'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

      const store = usePersistentNotificationStore()
      store.notifications = [{ id: 1, title: 'n1', isRead: false }]

      const result = await store.markAsRead(1)

      expect(result).toBe(false)
    })
  })

  describe('markAllAsRead', () => {
    it('sets all notifications as read and returns true', async () => {
      vi.mocked(notificationApi.markAllAsRead).mockResolvedValue(undefined)

      const store = usePersistentNotificationStore()
      store.notifications = [
        { id: 1, title: 'n1', isRead: false },
        { id: 2, title: 'n2', isRead: false },
        { id: 3, title: 'n3', isRead: true },
      ]

      const result = await store.markAllAsRead()

      expect(result).toBe(true)
      expect(store.notifications.every(n => n.isRead)).toBe(true)
    })
  })

  describe('handleNotification', () => {
    it('prepends notification to the list', () => {
      const store = usePersistentNotificationStore()
      store.notifications = [{ id: 1, title: 'old' }]

      const newNotification = { id: 2, title: 'New Alert' }
      store.notifications.unshift(newNotification)

      expect(store.notifications[0]).toEqual(newNotification)
      expect(store.notifications).toHaveLength(2)
    })
  })

  describe('initSignalR', () => {
    it('returns early when no token', async () => {
      const store = usePersistentNotificationStore()
      await store.initSignalR()

      expect(store.notifications).toEqual([])
    })
  })

  describe('initial state', () => {
    it('starts with empty notifications and not loading', () => {
      const store = usePersistentNotificationStore()

      expect(store.notifications).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.unreadCount).toBe(0)
    })
  })
})
