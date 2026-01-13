<template>
  <div class="layout-wrapper">
    <!-- Sidebar -->
    <AppSidebar v-model:visible="sidebarVisible" />

    <!-- Main Content Area -->
    <div class="layout-main-container" :class="{ 'sidebar-collapsed': !sidebarVisible }">
      <!-- Header -->
      <AppHeader @toggle-sidebar="sidebarVisible = !sidebarVisible" />

      <!-- Page Content -->
      <main class="layout-main">
        <router-view />
      </main>

      <!-- Footer -->
      <AppFooter />
    </div>

    <!-- Global Confirm Dialog -->
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePersistentNotificationStore } from '@/stores/persistentNotification'
import AppSidebar from '@/components/AppSidebar.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ConfirmDialog from 'primevue/confirmdialog'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = usePersistentNotificationStore()

const sidebarVisible = ref(true)

onMounted(() => {
  // Check authentication
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  // Connect to real-time notifications
  notificationStore.initSignalR()
})

onUnmounted(() => {
  if (notificationStore.disconnect) {
    notificationStore.disconnect()
  }
})
</script>

<style scoped>
.layout-wrapper {
  min-height: 100vh;
  background-color: var(--p-surface-ground);
}

.layout-main-container {
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.layout-main-container.sidebar-collapsed {
  margin-left: 64px;
}

.layout-main {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

@media (max-width: 991px) {
  .layout-main-container {
    margin-left: 0 !important;
  }

  .layout-main {
    padding: 1rem;
  }
}
</style>
