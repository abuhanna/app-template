import { HubConnectionBuilder } from '@microsoft/signalr'
import { io } from 'socket.io-client'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import notificationApi from '@/services/notificationApi'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

export const usePersistentNotificationStore = defineStore('persistentNotification', () => {
  const notifications = ref([])
  const loading = ref(false)
  const connection = ref(null)
  const notificationPermission = ref('default')

  const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

  const checkPermission = () => {
    if ('Notification' in window) {
      notificationPermission.value = Notification.permission
    }
  }

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      notificationPermission.value = permission
      return permission
    }
    return 'denied'
  }

  const handleNotification = (notification) => {
    // Add to list immediately
    notifications.value.unshift(notification)

    // Show toast/snackbar
    const notificationStore = useNotificationStore()
    notificationStore.showInfo(`New Notification: ${notification.title}`)

    // Show native notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const n = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
      })
      n.addEventListener('click', () => {
        window.focus()
        n.close()
      })
    }
  }

  const initSignalR = async () => {
    checkPermission()
    const authStore = useAuthStore()
    const token = authStore.token

    if (!token) {
      return
    }

    if (connection.value) {
      return
    }

    const backendType = import.meta.env.VITE_BACKEND_TYPE || 'dotnet'

    if (backendType === 'nest') {
      // Socket.io for NestJS
      const socketUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
      
      connection.value = io(`${socketUrl}/notifications`, {
        auth: {
          token: token
        },
        transports: ['websocket']
      })

      connection.value.on('connect', () => {
        if (import.meta.env.DEV) console.log('Socket.io connected successfully')
        fetchNotifications()
      })

      connection.value.on('notification', (notification) => {
        handleNotification(notification)
      })

      connection.value.on('connect_error', (error) => {
        console.error('Socket.io Connection Error:', error)
      })

    } else {
      // SignalR for .NET (default)
      const hubUrl = `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/hubs/notifications`

      connection.value = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
        })
        .configureLogging('none')
        .withAutomaticReconnect()
        .build()

      connection.value.on('ReceiveNotification', notification => {
        handleNotification(notification)
      })

      try {
        await connection.value.start()
        if (import.meta.env.DEV) console.log('SignalR connected successfully')

        // Fetch existing notifications after successful connection
        await fetchNotifications()
      } catch (error) {
        console.error('SignalR Connection Error:', error)
      }
    }
  }

  const fetchNotifications = async (filters = {}) => {
    loading.value = true
    try {
      // Default limit to 15 if no filters provided
      const params = {
        limit: 15,
        ...filters,
      }
      const response = await notificationApi.getMyNotifications(params)
      notifications.value = response.data
    } catch (error) {
      // Silent fail for notifications
      console.error('Failed to fetch notifications', error)
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async id => {
    try {
      await notificationApi.markAsRead(id)

      // Update local state
      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) {
        notifications.value[index].isRead = true
      }

      return true
    } catch (error) {
      console.error('Failed to mark as read', error)
      return false
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()

      // Update local state
      for (const n of notifications.value) {
        n.isRead = true
      }

      return true
    } catch (error) {
      console.error('Failed to mark all as read', error)
      return false
    }
  }

  return {
    notifications,
    loading,
    unreadCount,
    notificationPermission,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    initSignalR,
    requestPermission,
    checkPermission,
  }
})
