<template>
  <div class="p-3">
    <div class="flex justify-content-end mb-3">
      <Button
        v-if="unreadCount > 0"
        label="Mark all as read"
        icon="pi pi-check"
        severity="secondary"
        @click="handleMarkAllRead"
      />
    </div>

    <Card>
      <template #content>
        <div v-if="loading" class="flex justify-content-center p-6">
          <ProgressSpinner style="width: 50px; height: 50px" />
        </div>

        <div v-else-if="notifications.length === 0" class="flex flex-column align-items-center justify-content-center p-6 text-center text-500 gap-3">
          <i class="pi pi-inbox text-6xl opacity-50"></i>
          <span class="text-xl font-medium text-600">No notifications</span>
          <p class="m-0">You're all caught up!</p>
        </div>

        <div v-else class="flex flex-column">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="flex align-items-start p-3 border-bottom-1 surface-border hover:surface-hover cursor-pointer transition-colors transition-duration-200"
            :class="{ 'surface-50': !notification.isRead, 'border-left-3 border-primary-500': !notification.isRead }"
            @click="handleMarkAsRead(notification)"
          >
            <div 
                class="flex align-items-center justify-content-center border-round w-3rem h-3rem flex-shrink-0"
                :class="{
                    'bg-blue-100 text-blue-600': notification.type === 'info',
                    'bg-green-100 text-green-600': notification.type === 'success',
                    'bg-yellow-100 text-yellow-600': notification.type === 'warning',
                    'bg-red-100 text-red-600': notification.type === 'error'
                }"
            >
              <i class="text-xl" :class="getNotificationIcon(notification.type)"></i>
            </div>

            <div class="flex-1 ml-3">
              <div class="flex justify-content-between align-items-center mb-1">
                <span class="font-bold text-900">{{ notification.title }}</span>
                <span class="text-sm text-500">{{ formatTime(notification.createdAt) }}</span>
              </div>
              <p class="m-0 text-600 line-height-3">{{ notification.message }}</p>
            </div>

            <div class="flex align-items-center ml-3" v-if="!notification.isRead">
                <Button
                    icon="pi pi-circle-fill"
                    text
                    rounded
                    class="text-primary-500 w-2rem h-2rem"
                    v-tooltip.top="'Mark as read'"
                />
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePersistentNotificationStore } from '@/stores/persistentNotification'
import { useNotificationStore } from '@/stores/notification'
import Card from 'primevue/card'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'

const persistentNotificationStore = usePersistentNotificationStore()
const notificationStore = useNotificationStore()

const loading = ref(false)

const notifications = computed(() => persistentNotificationStore.notifications)
const unreadCount = computed(() => persistentNotificationStore.unreadCount)

const getNotificationIcon = (type) => {
  const icons = {
    info: 'pi pi-info-circle',
    success: 'pi pi-check-circle',
    warning: 'pi pi-exclamation-triangle',
    error: 'pi pi-times-circle',
  }
  return icons[type] || 'pi pi-bell'
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const handleMarkAsRead = async (notification) => {
  try {
    await persistentNotificationStore.markAsRead(notification.id)
  } catch (error) {
    notificationStore.error('Failed to mark notification as read')
  }
}

const handleMarkAllRead = async () => {
  try {
    await persistentNotificationStore.markAllAsRead()
    notificationStore.success('All notifications marked as read')
  } catch (error) {
    notificationStore.error('Failed to mark all notifications as read')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await persistentNotificationStore.fetchNotifications()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Scoped styles removed in favor of PrimeFlex utilities */
</style>
