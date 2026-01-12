<template>
  <v-app>
    <AppSidebar v-model="drawer" />
    <AppHeader @toggle-sidebar="drawer = !drawer" />
    <v-main>
      <router-view />
    </v-main>
    <AppNotification />
    <ConfirmDialog />
  </v-app>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useDisplay } from 'vuetify'
  import AppHeader from '@/components/AppHeader.vue'
  import AppNotification from '@/components/AppNotification.vue'
  import AppSidebar from '@/components/AppSidebar.vue'
  import ConfirmDialog from '@/components/ConfirmDialog.vue'
  import { usePersistentNotificationStore } from '@/stores/persistentNotification'

  const { mobile } = useDisplay()
  const drawer = ref(!mobile.value)
  const notificationStore = usePersistentNotificationStore()

  onMounted(() => {
    notificationStore.initSignalR()
  })
</script>
