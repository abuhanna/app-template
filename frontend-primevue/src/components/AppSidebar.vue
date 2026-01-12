<template>
  <Sidebar
    v-model:visible="sidebarVisible"
    :modal="isMobile"
    :dismissable="isMobile"
    :showCloseIcon="isMobile"
    class="app-sidebar"
    :pt="{
      root: { class: 'sidebar-root' },
      content: { class: 'sidebar-content' },
    }"
  >
    <!-- Logo Section -->
    <div class="sidebar-header">
      <div class="logo-container">
        <i class="pi pi-box logo-icon"></i>
        <span class="logo-text">AppTemplate</span>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li v-for="item in menuItems" :key="item.path">
          <router-link
            :to="item.path"
            class="nav-item"
            :class="{ active: isActive(item.path) }"
            @click="handleNavClick"
          >
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </router-link>
        </li>
      </ul>

      <!-- Admin Section -->
      <div v-if="isAdmin" class="nav-section">
        <span class="nav-section-title">Administration</span>
        <ul class="nav-list">
          <li v-for="item in adminMenuItems" :key="item.path">
            <router-link
              :to="item.path"
              class="nav-item"
              :class="{ active: isActive(item.path) }"
              @click="handleNavClick"
            >
              <i :class="item.icon"></i>
              <span>{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
  </Sidebar>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Sidebar from 'primevue/sidebar'

const visible = defineModel('visible', { default: true })
const sidebarVisible = computed({
  get: () => visible.value,
  set: (val) => (visible.value = val),
})

const route = useRoute()
const authStore = useAuthStore()

const isMobile = ref(false)

const isAdmin = computed(() => authStore.user?.role === 'Admin')

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'pi pi-home' },
  { label: 'Notifications', path: '/notifications', icon: 'pi pi-bell' },
]

const adminMenuItems = [
  { label: 'Users', path: '/users', icon: 'pi pi-users' },
  { label: 'Departments', path: '/departments', icon: 'pi pi-building' },
]

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const handleNavClick = () => {
  if (isMobile.value) {
    sidebarVisible.value = false
  }
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 992
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.app-sidebar :deep(.sidebar-root) {
  width: 280px;
  border-right: 1px solid var(--p-surface-border);
  background-color: var(--p-surface-card);
}

.app-sidebar :deep(.sidebar-content) {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--p-surface-border);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  font-size: 1.5rem;
  color: var(--p-primary-color);
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: var(--p-text-color);
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background-color: var(--p-surface-hover);
}

.nav-item.active {
  background-color: var(--p-primary-50);
  color: var(--p-primary-color);
  border-left-color: var(--p-primary-color);
  font-weight: 500;
}

.nav-item i {
  font-size: 1.125rem;
  width: 1.5rem;
  text-align: center;
}

.nav-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--p-surface-border);
}

.nav-section-title {
  display: block;
  padding: 0.5rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--p-text-muted-color);
  letter-spacing: 0.05em;
}
</style>
