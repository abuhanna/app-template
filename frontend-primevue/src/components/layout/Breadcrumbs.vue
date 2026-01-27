<template>
  <Breadcrumb :home="home" :model="breadcrumbs" class="p-0 bg-transparent border-none">
    <template #item="{ item }">
      <router-link v-if="item.route" :to="item.route" class="text-color no-underline">
        <span :class="item.icon" class="mr-1" />
        <span>{{ item.label }}</span>
      </router-link>
      <span v-else class="text-color-secondary">
        <span :class="item.icon" class="mr-1" />
        <span>{{ item.label }}</span>
      </span>
    </template>
  </Breadcrumb>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Breadcrumb from 'primevue/breadcrumb'

const route = useRoute()

const formatLabel = (segment) => {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const home = {
  icon: 'pi pi-home',
  route: '/',
}

const breadcrumbs = computed(() => {
  const paths = route.path.split('/').filter(Boolean)

  return paths.map((segment, index) => {
    const path = '/' + paths.slice(0, index + 1).join('/')
    const isLast = index === paths.length - 1

    return {
      label: formatLabel(segment),
      route: isLast ? undefined : path,
    }
  })
})
</script>

<style scoped>
:deep(.p-breadcrumb) {
  padding: 0;
  background: transparent;
  border: none;
}
</style>
