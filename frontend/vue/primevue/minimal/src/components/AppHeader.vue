<template>
  <header class="app-header">
    <div class="header-left">
      <Button
        icon="pi pi-bars"
        text
        rounded
        severity="secondary"
        @click="$emit('toggle-sidebar')"
        class="menu-button"
      />
      <Breadcrumbs />
    </div>

    <div class="header-right">
      <!-- Language Switcher -->
      <Button
        type="button"
        @click="toggleLangMenu"
        icon="pi pi-globe"
        text
        rounded
        severity="secondary"
        class="lang-button"
      />
      <Menu ref="langMenu" :model="langMenuItems" :popup="true" />

      <!-- Theme Toggle -->
      <Button
        type="button"
        @click="toggleThemeMenu"
        :icon="themeIcon"
        text
        rounded
        severity="secondary"
        class="theme-button"
      />
      <Menu ref="themeMenu" :model="themeMenuItems" :popup="true" />

      <!-- Notifications -->
      <NotificationMenu />

      <!-- User Menu -->
      <Button
        type="button"
        @click="toggleUserMenu"
        class="user-button"
        text
        rounded
      >
        <Avatar
          :label="userInitials"
          shape="circle"
          class="user-avatar"
        />
        <span class="user-name">{{ userName }}</span>
        <i class="pi pi-chevron-down" style="font-size: 0.75rem"></i>
      </Button>
      <Menu ref="userMenu" :model="userMenuItems" :popup="true" />
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useLocaleStore } from '@/stores/locale'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Menu from 'primevue/menu'
import NotificationMenu from '@/components/common/NotificationMenu.vue'
import Breadcrumbs from '@/components/layout/Breadcrumbs.vue'

defineEmits(['toggle-sidebar'])

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const localeStore = useLocaleStore()
const userMenu = ref()
const themeMenu = ref()
const langMenu = ref()

const themeIcon = computed(() => {
  const icons = {
    light: 'pi pi-sun',
    dark: 'pi pi-moon',
    system: 'pi pi-desktop',
  }
  return icons[themeStore.themeMode] || 'pi pi-desktop'
})

const themeMenuItems = ref([
  {
    label: 'Light',
    icon: 'pi pi-sun',
    command: () => themeStore.setTheme('light'),
  },
  {
    label: 'Dark',
    icon: 'pi pi-moon',
    command: () => themeStore.setTheme('dark'),
  },
  {
    label: 'System',
    icon: 'pi pi-desktop',
    command: () => themeStore.setTheme('system'),
  },
])

const toggleThemeMenu = (event) => {
  themeMenu.value.toggle(event)
}

const langMenuItems = computed(() =>
  localeStore.availableLocales.map(lang => ({
    label: lang.name,
    icon: localeStore.locale === lang.code ? 'pi pi-check' : '',
    command: () => localeStore.setLocale(lang.code),
  }))
)

const toggleLangMenu = (event) => {
  langMenu.value.toggle(event)
}


const userName = computed(() => authStore.user?.name || authStore.user?.username || 'User')
const userInitials = computed(() => {
  const name = userName.value
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

const userMenuItems = ref([
  {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    command: () => handleLogout(),
  },
])

const toggleUserMenu = (event) => {
  userMenu.value.toggle(event)
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background-color: var(--p-surface-card);
  border-bottom: 1px solid var(--p-surface-border);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--p-text-color);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
}

.user-avatar {
  background-color: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
}

.user-name {
  font-weight: 500;
  color: var(--p-text-color);
}

@media (max-width: 768px) {
  .user-name {
    display: none;
  }

  .app-title {
    font-size: 1rem;
  }
}
</style>
