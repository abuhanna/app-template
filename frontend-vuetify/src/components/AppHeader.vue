<template>
  <v-app-bar class="app-header" color="surface" elevation="0" height="64">
    <!-- Menu Toggle Button -->
    <v-app-bar-nav-icon
      class="ml-1"
      @click="$emit('toggle-sidebar')"
    >
      <v-icon>mdi-menu</v-icon>
    </v-app-bar-nav-icon>

    <!-- Page Title -->
    <v-app-bar-title class="ml-2 mobile-title-wrap">
      <h2
        class="font-weight-bold"
        :class="display.smAndDown.value ? 'text-subtitle-1 text-wrap' : 'text-h5'"
        :style="display.smAndDown.value ? 'line-height: 1.2' : ''"
      >
        {{ pageTitle }}
      </h2>
    </v-app-bar-title>

    <v-spacer />

    <!-- Page Actions Slot -->
    <div v-if="$slots.actions" class="mr-2">
      <slot name="actions" />
    </div>

    <!-- Action Buttons -->
    <div class="d-flex align-center mr-2">
      <!-- Theme Toggle -->
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            variant="text"
            size="small"
          >
            <v-icon>{{ themeIcon }}</v-icon>
          </v-btn>
        </template>
        <v-list density="compact" nav min-width="160">
          <v-list-item
            v-for="option in themeOptions"
            :key="option.value"
            :prepend-icon="option.icon"
            :active="themeStore.themeMode === option.value"
            @click="themeStore.setTheme(option.value)"
          >
            <v-list-item-title>{{ option.label }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- Notifications -->
      <NotificationMenu />

      <!-- User Menu -->
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn
            class="user-menu-btn ml-2"
            v-bind="props"
            variant="text"
          >
            <v-avatar size="36">
              <v-img
                :alt="userName"
                :src="userAvatarUrl"
              />
            </v-avatar>
            <span class="ml-2 d-none d-sm-inline text-body-2">{{ userName }}</span>
            <v-icon class="ml-1 d-none d-sm-inline" size="small">mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-card class="user-menu-card" min-width="240">
          <!-- User Info -->
          <v-card-text class="pa-4">
            <div class="d-flex align-center mb-3">
              <v-avatar size="48">
                <v-img
                  :alt="userName"
                  :src="userAvatarUrl"
                />
              </v-avatar>
              <div class="ml-3">
                <p class="text-body-2 font-weight-medium mb-0">{{ userName }}</p>
                <p class="text-caption text-medium-emphasis mb-0">{{ userDepartment }}</p>
              </div>
            </div>
          </v-card-text>

          <v-divider />

          <!-- Menu Items -->
          <v-list density="compact" nav>
            <v-list-item
              v-for="item in userMenuItems"
              :key="item.title"
              :prepend-icon="item.icon"
              :to="item.to"
              @click="item.action"
            >
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<script setup>
  import { storeToRefs } from 'pinia'
  import { computed, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { useDisplay } from 'vuetify'
  import NotificationMenu from '@/components/common/NotificationMenu.vue'
  import { useConfirmDialog } from '@/composables/useConfirmDialog'
  import { useAuthStore } from '@/stores/auth'
  import { useThemeStore } from '@/stores/theme'

  defineEmits(['toggle-sidebar'])

  const route = useRoute()
  const display = useDisplay()
  const confirmDialog = useConfirmDialog()
  const authStore = useAuthStore()
  const themeStore = useThemeStore()
  const { user } = storeToRefs(authStore)

  const themeOptions = [
    { value: 'light', label: 'Light', icon: 'mdi-white-balance-sunny' },
    { value: 'dark', label: 'Dark', icon: 'mdi-weather-night' },
    { value: 'system', label: 'System', icon: 'mdi-laptop' },
  ]

  const themeIcon = computed(() => {
    const icons = {
      light: 'mdi-white-balance-sunny',
      dark: 'mdi-weather-night',
      system: 'mdi-laptop',
    }
    return icons[themeStore.themeMode] || 'mdi-laptop'
  })

  const pageTitle = computed(() => {
    // Get title from route meta or generate from route name
    if (route.meta.title) {
      return route.meta.title
    }

    // Generate title from route path
    const pathSegments = route.path.split('/').filter(Boolean)

    if (pathSegments.length === 0) {
      return 'Dashboard'
    }

    // Handle detail pages with [id]
    if (route.params.id) {
      const basePath = pathSegments[0]
      return getTitleFromPath(basePath) + ' Detail'
    }

    // Handle form pages
    if (pathSegments.at(-1) === 'form') {
      const basePath = pathSegments[0]
      return route.query.id ? 'Edit ' + getTitleFromPath(basePath) : 'New ' + getTitleFromPath(basePath)
    }

    // Default: use first segment
    return getTitleFromPath(pathSegments[0])
  })

  function getTitleFromPath (path) {
    const titles = {
      'dashboard': 'Dashboard',
      'task': 'Tasks',
      'process': 'Process Instances',
      'process-definition': 'Process Definitions',
      'rule-set': 'Rule Sets',
      'transaction-type': 'Transaction Types',
      'department': 'Departments',
    }
    return titles[path] || path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
  }

  const userMenuItems = ref([
    { title: 'Profile', icon: 'mdi-account', to: '/profile' },
    { title: 'Logout', icon: 'mdi-logout', action: handleLogout },
  ])

  const userName = computed(() => user.value?.name || user.value?.username || 'User')
  const userDepartment = computed(() => user.value?.department || 'No Department')

  const userAvatarUrl = computed(() => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName.value)}&background=1976d2&color=fff`
  })

  async function handleLogout () {
    const confirmed = await confirmDialog.confirm({
      title: 'Sign Out',
      message: `Are you sure you want to sign out?\n\n• User: ${userName.value}\n• Department: ${userDepartment.value}\n\nYou will be redirected to the login page.`,
      icon: 'mdi-logout',
      color: 'warning',
      confirmLabel: 'Sign Out',
      cancelLabel: 'Stay Logged In',
    })

    if (confirmed) {
      await authStore.logout()
    }
  }
</script>

<style scoped>
.app-header {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.user-menu-btn {
  border-radius: 50px;
  text-transform: none;
}

.user-menu-card {
  margin-top: 8px;
}

:deep(.mobile-title-wrap .v-app-bar-title__content) {
  text-overflow: clip;
  white-space: normal;
  overflow: visible;
}
</style>
