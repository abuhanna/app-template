<template>
  <v-navigation-drawer
    app
    class="sidebar-drawer"
    :model-value="modelValue"
    :width="260"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- Sidebar Header -->
    <div class="sidebar-header px-4 d-flex align-center" style="height: 64px;">
      <v-avatar color="primary" size="40">
        <v-icon color="white" size="24">mdi-application</v-icon>
      </v-avatar>
      <div class="ml-3">
        <h3 class="text-h6 font-weight-bold">AppTemplate</h3>
        <p class="text-caption text-medium-emphasis mb-0">Application</p>
      </div>
    </div>

    <v-divider />

    <!-- Navigation Menu -->
    <v-list class="pa-3" density="comfortable" nav>
      <v-list-item
        v-for="item in navigationItems"
        :key="item.title"
        class="mb-1 nav-item"
        :prepend-icon="item.icon"
        rounded="lg"
        :to="item.to"
        :value="item.title"
      >
        <v-list-item-title>{{ item.title }}</v-list-item-title>
        <template v-if="item.badge" #append>
          <v-chip
            :color="item.badgeColor || 'primary'"
            density="compact"
            size="x-small"
          >
            {{ item.badge }}
          </v-chip>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
  import { computed } from 'vue'
  import { useAuthStore } from '@/stores/auth'

  defineProps({
    modelValue: {
      type: Boolean,
      default: true,
    },
  })

  defineEmits(['update:modelValue'])

  const authStore = useAuthStore()

  // All available menu items
  const allMenuItems = [
    {
      title: 'Dashboard',
      icon: 'mdi-view-dashboard',
      to: '/dashboard',
    },
    {
      title: 'Users',
      icon: 'mdi-account-group',
      to: '/users',
    },
    {
      title: 'Departments',
      icon: 'mdi-office-building',
      to: '/departments',
    },
    {
      title: 'Notifications',
      icon: 'mdi-bell',
      to: '/notifications',
    },
  ]

  // Restricted menu items for regular users
  const restrictedMenuItems = [
    {
      title: 'Dashboard',
      icon: 'mdi-view-dashboard',
      to: '/dashboard',
    },
    {
      title: 'Notifications',
      icon: 'mdi-bell',
      to: '/notifications',
    },
  ]

  // Filter navigation items based on user role
  const navigationItems = computed(() => {
    const role = authStore.user?.role

    // Admin users get all menus
    if (role === 'Admin') {
      return allMenuItems
    }

    // Regular users get restricted menus
    return restrictedMenuItems
  })
</script>

<style scoped>
.sidebar-drawer {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.sidebar-header {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.nav-item {
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.nav-item.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}

.nav-item.v-list-item--active :deep(.v-list-item__prepend .v-icon) {
  color: rgb(var(--v-theme-primary));
}

.nav-item.v-list-item--active::before {
  opacity: 0;
}
</style>
