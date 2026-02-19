<template>
  <v-container fluid>
    <v-card>
      <v-toolbar color="surface" density="compact">
        <v-toolbar-title class="text-h6">
          All Notifications
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          :disabled="loading || unreadCount === 0"
          :loading="markingAllRead"
          prepend-icon="mdi-check-all"
          variant="text"
          @click="markAllAsRead"
        >
          Mark all read
        </v-btn>
        <v-btn
          icon
          :loading="loading"
          @click="fetchNotifications"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-toolbar>

      <v-divider />

      <v-list v-if="loading && notifications.length === 0" lines="two">
        <v-list-item v-for="n in 5" :key="n">
          <template #prepend>
            <v-skeleton-loader type="avatar" />
          </template>
          <v-list-item-title>
            <v-skeleton-loader type="text" />
          </v-list-item-title>
          <v-list-item-subtitle>
            <v-skeleton-loader type="text" width="60%" />
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-list v-else-if="notifications.length > 0" lines="two">
        <template v-for="(item, index) in notifications" :key="item.id">
          <v-list-item
            :class="{ [isDark ? 'bg-grey-darken-3' : 'bg-blue-lighten-5']: !item.isRead }"
            :value="item"
            @click="handleNotificationClick(item)"
          >
            <template #prepend>
              <v-avatar class="mr-4" :color="getIconColor(item.type)" size="40" variant="tonal">
                <v-icon>{{ getIcon(item.type) }}</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-medium mb-1">
              {{ item.title }}
              <v-chip
                v-if="!item.isRead"
                class="ml-2"
                color="primary"
                label
                size="x-small"
              >
                NEW
              </v-chip>
            </v-list-item-title>

            <v-list-item-subtitle class="text-body-2 text-medium-emphasis text-wrap mb-2">
              {{ item.message }}
            </v-list-item-subtitle>

            <div class="d-flex align-center mt-1">
              <v-icon class="mr-1" color="grey" size="small">mdi-clock-outline</v-icon>
              <span class="text-caption text-medium-emphasis">
                {{ formatDateTime(item.createdAt) }}
                ({{ formatTimeAgo(item.createdAt) }})
              </span>
            </div>

            <template #append>
              <v-btn
                v-if="!item.isRead"
                color="primary"
                icon="mdi-check"
                size="small"
                variant="text"
                @click.stop="markAsRead(item)"
              >
                <v-tooltip activator="parent" location="top">Mark as read</v-tooltip>
              </v-btn>
            </template>
          </v-list-item>
          <v-divider v-if="index < notifications.length - 1" inset />
        </template>
      </v-list>

      <div v-else class="pa-12 text-center text-medium-emphasis">
        <v-icon class="mb-4" color="grey-lighten-2" size="64">mdi-bell-off-outline</v-icon>
        <p class="text-h6">No notifications</p>
        <p class="text-body-2">You're all caught up!</p>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useTheme } from 'vuetify'
  import notificationApi from '@/services/notificationApi'
  import { usePersistentNotificationStore } from '@/stores/persistentNotification'

  const router = useRouter()
  const store = usePersistentNotificationStore()
  const theme = useTheme()

  const isDark = computed(() => theme.global.current.value.dark)

  const notifications = ref([])
  const loading = ref(false)
  const markingAllRead = ref(false)
  const unreadCount = ref(0) // ... (rest of logic)

  onMounted(() => {
    fetchNotifications()
  })

  async function fetchNotifications () {
    loading.value = true
    try {
      // Fetch a larger batch for the full page view
      const response = await notificationApi.getMyNotifications({ limit: 50 })
      notifications.value = response.data
      updateUnreadCount()
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    } finally {
      loading.value = false
    }
  }

  function updateUnreadCount () {
    unreadCount.value = notifications.value.filter(n => !n.isRead).length
  }

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

  function formatDateTime (dateString) {
    return new Date(dateString).toLocaleString()
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

  async function markAsRead (notification) {
    try {
      await store.markAsRead(notification.id)
      notification.isRead = true
      updateUnreadCount()
    } catch {
      // Error handled in store/global handler
    }
  }

  async function markAllAsRead () {
    if (unreadCount.value === 0) return

    markingAllRead.value = true
    try {
      await store.markAllAsRead()
      for (const n of notifications.value) {
        n.isRead = true
      }
      updateUnreadCount()
    } catch {
      // Error handled in store/global handler
    } finally {
      markingAllRead.value = false
    }
  }

  async function handleNotificationClick (notification) {
    if (!notification.isRead) {
      await markAsRead(notification)
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

<route lang="yaml">
meta:
  title: All Notifications
  layout: default
</route>
