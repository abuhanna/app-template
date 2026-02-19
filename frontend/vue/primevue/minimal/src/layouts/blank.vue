<template>
  <div class="blank-layout">
    <router-view />
  </div>
</template>

<script setup>
// Blank layout - minimal wrapper for auth pages
</script>

<style scoped>
.blank-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
