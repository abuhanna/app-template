<template>
  <v-snackbar
    v-model="notificationStore.show"
    :color="getColor()"
    location="top right"
    :timeout="notificationStore.timeout"
    variant="elevated"
  >
    <div class="d-flex align-center">
      <v-icon class="mr-2" size="20">{{ getIcon() }}</v-icon>
      <span>{{ notificationStore.message }}</span>
    </div>
    <template #actions>
      <v-btn
        icon
        size="small"
        variant="text"
        @click="notificationStore.hide()"
      >
        <v-icon size="20">mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
  import { useNotificationStore } from '@/stores/notification'

  const notificationStore = useNotificationStore()

  function getColor () {
    const colors = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info',
    }
    return colors[notificationStore.type] || 'info'
  }

  function getIcon () {
    const icons = {
      success: 'mdi-check-circle',
      error: 'mdi-alert-circle',
      warning: 'mdi-alert',
      info: 'mdi-information',
    }
    return icons[notificationStore.type] || 'mdi-information'
  }
</script>

<style scoped>
:deep(.v-snackbar__wrapper) {
  min-width: 300px;
  max-width: 500px;
}
</style>
