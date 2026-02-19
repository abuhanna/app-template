import { create } from 'zustand'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface ToastNotification {
  id: string
  message: string
  type: NotificationType
  duration: number
}

interface NotificationState {
  notifications: ToastNotification[]

  // Actions
  showNotification: (message: string, type: NotificationType, duration?: number) => void
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  showWarning: (message: string, duration?: number) => void
  showInfo: (message: string, duration?: number) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  showNotification: (message, type, duration = 5000) => {
    const id = crypto.randomUUID()
    const notification: ToastNotification = { id, message, type, duration }

    set((state) => ({
      notifications: [...state.notifications, notification],
    }))

    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(id)
      }, duration)
    }
  },

  showSuccess: (message, duration) => {
    get().showNotification(message, 'success', duration)
  },

  showError: (message, duration) => {
    get().showNotification(message, 'error', duration)
  },

  showWarning: (message, duration) => {
    get().showNotification(message, 'warning', duration)
  },

  showInfo: (message, duration) => {
    get().showNotification(message, 'info', duration)
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  clearAll: () => {
    set({ notifications: [] })
  },
}))
