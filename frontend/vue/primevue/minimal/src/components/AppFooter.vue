<template>
  <footer class="app-footer">
    <span>&copy; {{ currentYear }} AppTemplate. All rights reserved.</span>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.app-footer {
  padding: 1rem 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  border-top: 1px solid var(--p-surface-border);
  background-color: var(--p-surface-card);
}
</style>
