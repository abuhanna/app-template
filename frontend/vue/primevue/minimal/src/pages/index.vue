<template>
  <div></div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

definePage({
  meta: {
    layout: 'blank',
  },
})

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.replace('/notifications')
  } else {
    router.replace('/login')
  }
})
</script>
