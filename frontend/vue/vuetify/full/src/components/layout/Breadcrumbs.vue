<template>
  <v-breadcrumbs :items="breadcrumbs" class="px-0 py-2">
    <template #prepend>
      <v-icon icon="mdi-home" size="small" class="me-1" />
    </template>
    <template #divider>
      <v-icon icon="mdi-chevron-right" size="small" />
    </template>
  </v-breadcrumbs>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const formatLabel = (segment) => {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const breadcrumbs = computed(() => {
  const paths = route.path.split('/').filter(Boolean)

  // Start with Home
  const items = [
    {
      title: 'Home',
      to: '/',
      disabled: false,
    },
  ]

  // Build breadcrumb trail
  paths.forEach((segment, index) => {
    const path = '/' + paths.slice(0, index + 1).join('/')
    const isLast = index === paths.length - 1

    items.push({
      title: formatLabel(segment),
      to: path,
      disabled: isLast,
    })
  })

  return items
})
</script>
