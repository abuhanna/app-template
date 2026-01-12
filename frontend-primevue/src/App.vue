<template>
  <div :class="{ 'app-dark': isDarkMode }">
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
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Toast from 'primevue/toast'
import ProgressSpinner from 'primevue/progressspinner'

const authStore = useAuthStore()
const isInitializing = ref(true)
const isDarkMode = ref(false)

onMounted(() => {
  // Check system preference for dark mode
  isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches

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
.app-dark {
  color-scheme: dark;
}
</style>
