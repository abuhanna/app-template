<template>
  <div class="notification-menu">
    <Button
      type="button"
      @click="toggleMenu"
      text
      rounded
      severity="secondary"
      class="notification-button"
      v-badge.danger="unreadCount > 0 ? unreadCount : null"
    >
      <i class="pi pi-bell" style="font-size: 1.25rem"></i>
    </Button>

    <Popover ref="notificationPopover" appendTo="body" class="notification-popover">
      <div class="notification-header">
        <span class="notification-title">Notifications</span>
        <Button
          v-if="unreadCount > 0"
          label="Mark all read"
          text
          size="small"
          @click="handleMarkAllRead"
        />
      </div>

      <div class="notification-list">
        <div v-if="notifications.length === 0" class="notification-empty">
          <i class="pi pi-inbox"></i>
          <span>No notifications</span>
        </div>

        <div
          v-for="notification in notifications.slice(0, 5)"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.isRead }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">
            <i :class="getNotificationIcon(notification.type)"></i>
          </div>
          <div class="notification-content">
            <span class="notification-item-title">{{ notification.title }}</span>
            <span class="notification-message">{{ notification.message }}</span>
            <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div v-if="notifications.length > 0" class="notification-footer">
        <router-link to="/notifications" class="view-all-link" @click="hideMenu">
          View all notifications
        </router-link>
      </div>
    </Popover>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePersistentNotificationStore } from '@/stores/persistentNotification'
import Button from 'primevue/button'
import Popover from 'primevue/popover'
import Badge from 'primevue/badgedirective'

const vBadge = Badge

const notificationStore = usePersistentNotificationStore()
const notificationPopover = ref()

const notifications = computed(() => notificationStore.notifications)
const unreadCount = computed(() => notificationStore.unreadCount)

const toggleMenu = (event) => {
  notificationPopover.value.toggle(event)
}

const hideMenu = () => {
  notificationPopover.value.hide()
}

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
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}

const handleNotificationClick = async (notification) => {
  if (!notification.isRead) {
    await notificationStore.markAsRead(notification.id)
  }
}

const handleMarkAllRead = async () => {
  await notificationStore.markAllAsRead()
}
</script>

<style scoped>
.notification-menu {
  position: relative;
}

.notification-button {
  position: relative;
}

.notification-popover {
  width: 360px;
  max-width: 90vw;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--p-surface-border);
}

.notification-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--p-text-color);
}

.notification-list {
  max-height: 320px;
  overflow-y: auto;
}

.notification-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--p-text-muted-color);
  gap: 0.5rem;
}

.notification-empty i {
  font-size: 2rem;
}

.notification-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--p-surface-border);
}

.notification-item:hover {
  background-color: var(--p-surface-hover);
}

.notification-item.unread {
  background-color: var(--p-primary-50);
}

.notification-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--p-surface-100);
  color: var(--p-primary-color);
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.notification-item-title {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--p-text-color);
}

.notification-message {
  font-size: 0.8125rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
}

.notification-footer {
  padding: 0.75rem 1rem;
  text-align: center;
  border-top: 1px solid var(--p-surface-border);
}

.view-all-link {
  color: var(--p-primary-color);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

.view-all-link:hover {
  text-decoration: underline;
}
</style>
