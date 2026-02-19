// src/stores/notification.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const show = ref(false)
  const message = ref('')
  const type = ref('info') // info, success, error, warning
  const timeout = ref(3000)

  const showNotification = (msg, notifType = 'info', duration = 3000) => {
    message.value = msg
    type.value = notifType
    timeout.value = duration
    show.value = true
  }

  const showSuccess = (msg, duration = 3000) => {
    showNotification(msg, 'success', duration)
  }

  const showError = (msg, duration = 3000) => {
    showNotification(msg, 'error', duration)
  }

  const showInfo = (msg, duration = 3000) => {
    showNotification(msg, 'info', duration)
  }

  const showWarning = (msg, duration = 3000) => {
    showNotification(msg, 'warning', duration)
  }

  const hide = () => {
    show.value = false
  }

  return {
    show,
    message,
    type,
    timeout,
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    hide,
  }
})
