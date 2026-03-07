import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'test-uuid') })

import { useNotificationStore } from '../notificationStore'

describe('NotificationStore', () => {
  beforeEach(() => {
    useNotificationStore.setState({ notifications: [] })
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('showNotification', () => {
    it('adds notification with correct id, message, and type', () => {
      useNotificationStore.getState().showNotification('Test message', 'info')

      const { notifications } = useNotificationStore.getState()
      expect(notifications).toHaveLength(1)
      expect(notifications[0]).toEqual({
        id: 'test-uuid',
        message: 'Test message',
        type: 'info',
        duration: 5000,
      })
    })
  })

  describe('showSuccess', () => {
    it('sets type to success', () => {
      useNotificationStore.getState().showSuccess('Success!')

      const { notifications } = useNotificationStore.getState()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe('success')
      expect(notifications[0].message).toBe('Success!')
    })
  })

  describe('showError', () => {
    it('sets type to error', () => {
      useNotificationStore.getState().showError('Error!')

      const { notifications } = useNotificationStore.getState()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe('error')
    })
  })

  describe('showWarning', () => {
    it('sets type to warning', () => {
      useNotificationStore.getState().showWarning('Warning!')

      const { notifications } = useNotificationStore.getState()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe('warning')
    })
  })

  describe('showInfo', () => {
    it('sets type to info', () => {
      useNotificationStore.getState().showInfo('Info!')

      const { notifications } = useNotificationStore.getState()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe('info')
    })
  })

  describe('removeNotification', () => {
    it('removes notification by id', () => {
      useNotificationStore.setState({
        notifications: [
          { id: 'abc', message: 'keep', type: 'info', duration: 5000 },
          { id: 'def', message: 'remove', type: 'error', duration: 5000 },
        ],
      })

      useNotificationStore.getState().removeNotification('def')

      const { notifications } = useNotificationStore.getState()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].id).toBe('abc')
    })
  })

  describe('clearAll', () => {
    it('empties notifications array', () => {
      useNotificationStore.setState({
        notifications: [
          { id: 'a', message: 'msg1', type: 'info', duration: 5000 },
          { id: 'b', message: 'msg2', type: 'error', duration: 5000 },
        ],
      })

      useNotificationStore.getState().clearAll()

      expect(useNotificationStore.getState().notifications).toEqual([])
    })
  })
})
