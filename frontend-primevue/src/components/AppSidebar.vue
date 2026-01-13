<template>
  <aside class="app-sidebar" :class="{ collapsed: !visible }">
    <!-- Logo Section -->
    <div class="sidebar-header">
      <div class="logo-container">
        <i class="pi pi-box logo-icon"></i>
        <span v-if="visible" class="logo-text">AppTemplate</span>
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
            v-tooltip.right="{ value: item.label, disabled: visible }"
          >
            <i :class="item.icon"></i>
            <span v-if="visible">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>

      <!-- Admin Section -->
      <div v-if="isAdmin" class="nav-section">
        <span v-if="visible" class="nav-section-title">Administration</span>
        <ul class="nav-list">
          <li v-for="item in adminMenuItems" :key="item.path">
            <router-link
              :to="item.path"
              class="nav-item"
              :class="{ active: isActive(item.path) }"
              v-tooltip.right="{ value: item.label, disabled: visible }"
            >
              <i :class="item.icon"></i>
              <span v-if="visible">{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const visible = defineModel('visible', { default: true })

const route = useRoute()
const authStore = useAuthStore()

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
</script>

<style scoped>
.app-sidebar {
  width: 260px;
  min-width: 260px;
  height: 100vh;
  background-color: var(--p-surface-card);
  border-right: 1px solid var(--p-surface-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  transition: width 0.3s ease, min-width 0.3s ease;
}

.app-sidebar.collapsed {
  width: 64px;
  min-width: 64px;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--p-surface-border);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
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
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--p-text-color);
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: 0.5rem 0;
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
  padding: 0.75rem 1rem;
  color: var(--p-text-color);
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.collapsed .nav-item {
  justify-content: center;
  padding: 0.75rem;
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
  width: 1.25rem;
  text-align: center;
}

.nav-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--p-surface-border);
}

.nav-section-title {
  display: block;
  padding: 0.5rem 1rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--p-text-muted-color);
  letter-spacing: 0.05em;
}

@media (max-width: 991px) {
  .app-sidebar {
    transform: translateX(-100%);
  }

  .app-sidebar:not(.collapsed) {
    transform: translateX(0);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }
}
</style>
