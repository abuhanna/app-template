<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
    <AppNotification />
    <ConfirmDialog />
  </v-app>
</template>

<script setup>
  import AppNotification from '@/components/AppNotification.vue'
  import ConfirmDialog from '@/components/ConfirmDialog.vue'
</script>
