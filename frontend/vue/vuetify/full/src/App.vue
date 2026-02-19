<template>
  <v-app>
    <!-- Loading Screen -->
    <v-fade-transition>
      <div v-if="isInitializing" class="loading-screen">
        <div class="loading-content">
          <v-progress-circular
            color="primary"
            indeterminate
            size="64"
          />
          <p class="text-h6 mt-4 text-primary">Loading...</p>
        </div>
      </div>
    </v-fade-transition>

    <!-- Main App -->
    <router-view v-if="!isInitializing" />
  </v-app>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { useThemeStore } from '@/stores/theme'

  const authStore = useAuthStore()
  const themeStore = useThemeStore()
  const isInitializing = ref(true)

  onMounted(() => {
    // Initialize auth from localStorage
    authStore.initAuth()

    // Initialize theme (store auto-applies on creation, but this ensures it's loaded)
    // Theme is already applied in the store constructor

    // Small delay to ensure smooth transition
    setTimeout(() => {
      isInitializing.value = false
    }, 300)
  })
</script>

<style scoped>
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

.loading-content .text-h6 {
  color: white !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>
