<template>
  <v-menu :close-on-content-click="false" max-width="380" min-width="320" offset-y>
    <template #activator="{ props }">
      <v-btn
        class="mx-1"
        icon
        size="small"
        variant="text"
        v-bind="props"
      >
        <v-badge
          v-if="unreadCount > 0"
          color="error"
          :content="unreadCount"
          dot
        >
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
        <v-icon v-else>mdi-bell-outline</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="d-flex justify-space-between align-center py-2 px-4 shadow-sm">
        <span class="text-subtitle-1 font-weight-bold">Notifications</span>
        <v-btn
          v-if="unreadCount > 0"
          color="primary"
          size="x-small"
          variant="text"
          @click="markAllAsRead"
        >
          Mark all read
        </v-btn>
      </v-card-title>
      <v-divider />

      <div v-if="loading" class="pa-4 text-center">
        <v-progress-circular color="primary" indeterminate size="24" />
      </div>

      <div v-if="notificationPermission === 'default' && !mobile" class="px-4 py-2">
        <v-alert
          class="mb-0"
          color="info"
          density="compact"
          icon="mdi-bell-ring"
          variant="tonal"
        >
          <div class="text-caption">
            <strong>Enable Desktop Notifications</strong>
            <p class="mb-2 mt-1">Get notified even when this tab is in the background.</p>
            <v-btn
              block
              color="primary"
              density="compact"
              prepend-icon="mdi-bell-check"
              size="small"
              variant="flat"
              @click="requestPermission"
            >
              Enable Notifications
            </v-btn>
          </div>
        </v-alert>
      </div>

      <div v-else-if="notificationPermission === 'denied' && !mobile" class="px-4 py-2">
        <v-alert
          class="mb-0"
          color="warning"
          density="compact"
          icon="mdi-bell-off"
          variant="tonal"
        >
          <div class="text-caption">
            <strong>Notifications Blocked</strong>
            <p class="mb-2 mt-1">To receive desktop notifications:</p>
            <ol class="pl-4 mb-2" style="line-height: 1.6;">
              <li>Click the <v-icon size="x-small">mdi-lock</v-icon> or <v-icon size="x-small">mdi-tune</v-icon> icon in your browser's address bar</li>
              <li>Find "Notifications" and change to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
            <v-btn
              block
              color="primary"
              density="compact"
              prepend-icon="mdi-refresh"
              size="small"
              variant="outlined"
              @click="reloadPage"
            >
              Refresh Page
            </v-btn>
          </div>
        </v-alert>
      </div>

      <v-list v-if="notifications.length > 0" class="overflow-y-auto pa-0" lines="two">
        <template v-for="(item, index) in displayedNotifications" :key="item.id">
          <v-list-item
            class="notification-item py-2"
            :class="{ [isDark ? 'bg-grey-darken-3' : 'bg-blue-lighten-5']: !item.isRead }"
            :value="item"
            @click="handleNotificationClick(item)"
          >
            <template #prepend>
              <v-avatar class="mr-2" :color="getIconColor(item.type)" size="32" variant="tonal">
                <v-icon size="small">{{ getIcon(item.type) }}</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="text-subtitle-2 font-weight-medium mb-1">
              {{ item.title }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption text-medium-emphasis text-wrap mb-1" style="line-height: 1.3;">
              {{ item.message }}
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex flex-column align-end">
                <span class="text-caption text-disabled" style="font-size: 10px !important;">
                  {{ formatTimeAgo(item.createdAt) }}
                </span>
                <v-icon v-if="!item.isRead" class="mt-1" color="primary" size="8">mdi-circle</v-icon>
              </div>
            </template>
          </v-list-item>
          <v-divider v-if="index < displayedNotifications.length - 1" inset />
        </template>
      </v-list>

      <div v-else class="pa-8 text-center text-medium-emphasis">
        <v-icon class="mb-2" color="grey-lighten-2" size="48">mdi-bell-off-outline</v-icon>
        <p class="text-body-2">No notifications</p>
      </div>

      <v-divider v-if="notifications.length > 0" />
      <div v-if="notifications.length > 0" class="pa-2 bg-grey-lighten-5">
        <v-btn
          block
          class="text-none"
          color="primary"
          to="/notifications"
          variant="text"
        >
          View All Notifications
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup>
  import { storeToRefs } from 'pinia'
  import { computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useDisplay, useTheme } from 'vuetify'
  import { usePersistentNotificationStore } from '@/stores/persistentNotification'

  const router = useRouter()
  const store = usePersistentNotificationStore()
  const { notifications, unreadCount, loading, notificationPermission } = storeToRefs(store)
  const { mobile } = useDisplay()
  const theme = useTheme()

  const isDark = computed(() => theme.global.current.value.dark)

  const displayedNotifications = computed(() => notifications.value.slice(0, 5))

  function requestPermission () {
    store.requestPermission()
  }

  function reloadPage () {
    window.location.reload()
  }

  function onMountedHook () {
    store.checkPermission()
    store.fetchNotifications()
  }

  onMounted(onMountedHook)

  function getIcon (type) {
    switch (type) {
      case 'info': { return 'mdi-information-variant'
      }
      case 'success': { return 'mdi-check-circle-outline'
      }
      case 'warning': { return 'mdi-alert-circle-outline'
      }
      case 'error': { return 'mdi-alert-octagon-outline'
      }
      default: { return 'mdi-bell-outline'
      }
    }
  }

  function getIconColor (type) {
    switch (type) {
      case 'info': { return 'info'
      }
      case 'success': { return 'success'
      }
      case 'warning': { return 'warning'
      }
      case 'error': { return 'error'
      }
      default: { return 'grey'
      }
    }
  }

  function formatTimeAgo (dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)

    if (seconds < 60) return 'Just now'

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`

    return date.toLocaleDateString()
  }

  async function markAllAsRead () {
    await store.markAllAsRead()
  }

  async function handleNotificationClick (notification) {
    if (!notification.isRead) {
      await store.markAsRead(notification.id)
    }

    if (notification.referenceId) {
      if (notification.referenceType === 'Process') {
        router.push(`/process/${notification.referenceId}`)
      } else if (notification.referenceType === 'Task') {
        router.push(`/task/${notification.referenceId}`)
      }
    }
  }
</script>

<style scoped>
.notification-item {
  cursor: pointer;
  transition: background-color 0.2s;
}
.notification-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>
