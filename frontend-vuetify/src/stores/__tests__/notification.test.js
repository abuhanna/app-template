import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '../notification'

describe('Notification Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default values', () => {
    const store = useNotificationStore()

    expect(store.show).toBe(false)
    expect(store.message).toBe('')
    expect(store.type).toBe('info')
    expect(store.timeout).toBe(3000)
  })

  it('should show notification with custom message and type', () => {
    const store = useNotificationStore()

    store.showNotification('Test message', 'success', 5000)

    expect(store.show).toBe(true)
    expect(store.message).toBe('Test message')
    expect(store.type).toBe('success')
    expect(store.timeout).toBe(5000)
  })

  it('should show success notification', () => {
    const store = useNotificationStore()

    store.showSuccess('Operation successful')

    expect(store.show).toBe(true)
    expect(store.message).toBe('Operation successful')
    expect(store.type).toBe('success')
  })

  it('should show error notification', () => {
    const store = useNotificationStore()

    store.showError('Something went wrong')

    expect(store.show).toBe(true)
    expect(store.message).toBe('Something went wrong')
    expect(store.type).toBe('error')
  })

  it('should show info notification', () => {
    const store = useNotificationStore()

    store.showInfo('Information message')

    expect(store.show).toBe(true)
    expect(store.message).toBe('Information message')
    expect(store.type).toBe('info')
  })

  it('should show warning notification', () => {
    const store = useNotificationStore()

    store.showWarning('Warning message')

    expect(store.show).toBe(true)
    expect(store.message).toBe('Warning message')
    expect(store.type).toBe('warning')
  })

  it('should hide notification', () => {
    const store = useNotificationStore()

    store.showSuccess('Test message')
    expect(store.show).toBe(true)

    store.hide()
    expect(store.show).toBe(false)
  })

  it('should use default timeout when not specified', () => {
    const store = useNotificationStore()

    store.showSuccess('Test message')

    expect(store.timeout).toBe(3000)
  })

  it('should use custom timeout when specified', () => {
    const store = useNotificationStore()

    store.showSuccess('Test message', 10000)

    expect(store.timeout).toBe(10000)
  })
})
