<template>
  <div class="notifications-page">
    <div class="page-header">
      <div>
        <h1>Notifications</h1>
        <p class="page-subtitle">View and manage your notifications</p>
      </div>
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
        <div v-if="loading" class="loading-state">
          <ProgressSpinner style="width: 50px; height: 50px" />
        </div>

        <div v-else-if="notifications.length === 0" class="empty-state">
          <i class="pi pi-inbox"></i>
          <span>No notifications</span>
          <p>You're all caught up!</p>
        </div>

        <div v-else class="notification-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.isRead }"
          >
            <div class="notification-icon" :class="notification.type">
              <i :class="getNotificationIcon(notification.type)"></i>
            </div>

            <div class="notification-content">
              <div class="notification-header">
                <span class="notification-title">{{ notification.title }}</span>
                <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
              </div>
              <p class="notification-message">{{ notification.message }}</p>
            </div>

            <div class="notification-actions">
              <Button
                v-if="!notification.isRead"
                icon="pi pi-check"
                text
                rounded
                severity="info"
                @click="handleMarkAsRead(notification)"
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
.notifications-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-header h1 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.page-subtitle {
  margin: 0;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--p-text-muted-color);
  text-align: center;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: var(--p-surface-400);
}

.empty-state span {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--p-text-color);
}

.empty-state p {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
}

.notification-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--p-surface-border);
  transition: background-color 0.2s;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: var(--p-surface-hover);
}

.notification-item.unread {
  background-color: var(--p-primary-50);
}

.notification-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon i {
  font-size: 1.25rem;
}

.notification-icon.info {
  background-color: var(--p-blue-100);
  color: var(--p-blue-600);
}

.notification-icon.success {
  background-color: var(--p-green-100);
  color: var(--p-green-600);
}

.notification-icon.warning {
  background-color: var(--p-yellow-100);
  color: var(--p-yellow-600);
}

.notification-icon.error {
  background-color: var(--p-red-100);
  color: var(--p-red-600);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.notification-title {
  font-weight: 600;
  color: var(--p-text-color);
}

.notification-time {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
}

.notification-message {
  margin: 0;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  line-height: 1.5;
}

.notification-actions {
  display: flex;
  align-items: flex-start;
}
</style>
