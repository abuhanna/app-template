<template>
  <div>
    <!-- Loading Screen -->
    <Transition name="fade">
      <div v-if="isInitializing" class="loading-screen">
        <div class="loading-content">
          <ProgressSpinner
            style="width: 64px; height: 64px"
            strokeWidth="4"
            animationDuration=".8s"
          />
          <p class="loading-text">Loading...</p>
        </div>
      </div>
    </Transition>

    <!-- Main App -->
    <router-view v-if="!isInitializing" />

    <!-- Global Toast -->
    <Toast position="top-right" />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useThemeStore } from '@/stores/theme'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import ProgressSpinner from 'primevue/progressspinner'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const themeStore = useThemeStore()
const toast = useToast()

const isInitializing = ref(true)

// Watch for notifications and display toasts
watch(() => notificationStore.show, (newValue) => {
  if (newValue) {
    toast.add({
      severity: notificationStore.type,
      summary: notificationStore.type.charAt(0).toUpperCase() + notificationStore.type.slice(1),
      detail: notificationStore.message,
      life: notificationStore.timeout
    })

    // Reset show state so it can be triggered again even with same message
    // Use a small timeout to avoid immediate reset loops if any
    setTimeout(() => {
        notificationStore.hide()
    }, 100)
  }
})

onMounted(() => {
  // Initialize theme (store auto-applies on creation)
  // Theme is already applied in the store constructor

  // Initialize auth from localStorage
  authStore.initAuth()

  // Small delay to ensure smooth transition
  setTimeout(() => {
    isInitializing.value = false
  }, 300)
})
</script>

<style>
/* Global styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
}

#app {
  height: 100%;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Loading screen */
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a237e 0%, #311b92 50%, #4a148c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-text {
  margin-top: 1rem;
  font-size: 1.25rem;
  font-weight: 500;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Dark mode adjustments for PrimeVue */
html.app-dark {
  color-scheme: dark;
  --surface-ground: #121212;
  --surface-section: #1e1e1e;
  --surface-card: #1e1e1e;
  --surface-overlay: #1e1e1e;
  --surface-border: #383838;
  --surface-hover: rgba(255, 255, 255, 0.04);
  --text-color: rgba(255, 255, 255, 0.87);
  --text-color-secondary: rgba(255, 255, 255, 0.6);
  --p-text-color: rgba(255, 255, 255, 0.87);
  --p-text-secondary-color: rgba(255, 255, 255, 0.6);
  --p-surface-card: #1e1e1e;
  --p-surface-border: #383838;
  --p-surface-ground: #121212;
  --p-surface-hover: rgba(255, 255, 255, 0.04);
}

html.app-dark body {
  background-color: #121212;
  color: rgba(255, 255, 255, 0.87);
}

html.app-dark .app-header {
  background-color: #1e1e1e;
  border-color: #383838;
}

html.app-dark .page-title {
  color: rgba(255, 255, 255, 0.87);
}

html.app-dark .user-name {
  color: rgba(255, 255, 255, 0.87);
}

html.app-dark .p-component {
  color: rgba(255, 255, 255, 0.87);
}

html.app-dark .p-inputtext {
  background: #2d2d2d;
  border-color: #383838;
  color: rgba(255, 255, 255, 0.87);
}

html.app-dark .p-button.p-button-text {
  color: rgba(255, 255, 255, 0.87);
}

html.app-dark .p-menu {
  background: #1e1e1e;
  border-color: #383838;
}

html.app-dark .p-menuitem-text,
html.app-dark .p-menuitem-icon {
  color: rgba(255, 255, 255, 0.87);
}

html.app-dark .p-datatable .p-datatable-thead > tr > th,
html.app-dark .p-datatable .p-datatable-tbody > tr {
  background: #1e1e1e;
  color: rgba(255, 255, 255, 0.87);
  border-color: #383838;
}

html.app-dark .p-datatable .p-datatable-tbody > tr:nth-child(even) {
  background: #252525;
}

html.app-dark .p-card {
  background: #1e1e1e;
  color: rgba(255, 255, 255, 0.87);
}

html.app-dark .p-dialog .p-dialog-header,
html.app-dark .p-dialog .p-dialog-content,
html.app-dark .p-dialog .p-dialog-footer {
  background: #1e1e1e;
  color: rgba(255, 255, 255, 0.87);
  border-color: #383838;
}
</style>
