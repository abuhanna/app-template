import { create } from 'zustand'
import { HubConnectionBuilder, HubConnection, HubConnectionState } from '@microsoft/signalr'
import { io, Socket } from 'socket.io-client'
import type { Notification } from '@/types'
import * as notificationApi from '@/services/notificationApi'
import { useAuthStore } from './authStore'
import { useNotificationStore } from './notificationStore'

type ConnectionType = HubConnection | Socket | null

interface PersistentNotificationState {
  notifications: Notification[]
  loading: boolean
  connection: ConnectionType
  notificationPermission: NotificationPermission
  unreadCount: number

  // Actions
  initConnection: () => Promise<void>
  disconnect: () => void
  fetchNotifications: (params?: { limit?: number }) => Promise<void>
  markAsRead: (id: string) => Promise<boolean>
  markAllAsRead: () => Promise<boolean>
  requestPermission: () => Promise<NotificationPermission>
  addNotification: (notification: Notification) => void
}

export const usePersistentNotificationStore = create<PersistentNotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  connection: null,
  notificationPermission: 'default',
  unreadCount: 0,

  initConnection: async () => {
    const token = useAuthStore.getState().token
    if (!token || get().connection) return

    const backendType = import.meta.env.VITE_BACKEND_TYPE || 'dotnet'
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''

    const handleNotification = (notification: Notification) => {
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }))
      useNotificationStore.getState().showInfo(`New: ${notification.title}`)

      // Show native notification if permitted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
        })
      }
    }

    if (backendType === 'nest') {
      // Socket.io for NestJS
      const socket = io(`${baseUrl}/notifications`, {
        auth: { token },
        transports: ['websocket'],
      })

      socket.on('connect', () => {
        console.log('Socket.io connected')
        get().fetchNotifications()
      })

      socket.on('notification', handleNotification)

      socket.on('disconnect', () => {
        console.log('Socket.io disconnected')
      })

      set({ connection: socket as ConnectionType })
    } else {
      // SignalR for .NET and Spring
      const hubConnection = new HubConnectionBuilder()
        .withUrl(`${baseUrl}/hubs/notifications`, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build()

      hubConnection.on('ReceiveNotification', handleNotification)

      try {
        await hubConnection.start()
        console.log('SignalR connected')
        await get().fetchNotifications()
        set({ connection: hubConnection as ConnectionType })
      } catch (error) {
        console.error('SignalR connection error:', error)
      }
    }
  },

  disconnect: () => {
    const { connection } = get()
    if (!connection) return

    const backendType = import.meta.env.VITE_BACKEND_TYPE || 'dotnet'

    if (backendType === 'nest') {
      (connection as Socket).disconnect()
    } else {
      const hubConnection = connection as HubConnection
      if (hubConnection.state === HubConnectionState.Connected) {
        hubConnection.stop()
      }
    }

    set({ connection: null })
  },

  fetchNotifications: async (params = { limit: 15 }) => {
    set({ loading: true })
    try {
      const response = await notificationApi.getMyNotifications(params)
      set({
        notifications: response.data,
        unreadCount: response.unreadCount,
        loading: false,
      })
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      set({ loading: false })
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationApi.markAsRead(id)
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
      return true
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      return false
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead()
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }))
      return true
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      return false
    }
  },

  requestPermission: async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      set({ notificationPermission: permission })
      return permission
    }
    return 'denied'
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },
}))
