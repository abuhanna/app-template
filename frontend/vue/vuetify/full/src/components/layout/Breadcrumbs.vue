<template>
  <v-breadcrumbs class="px-0 py-2" :items="breadcrumbs">
    <template #prepend>
      <v-icon class="me-1" icon="mdi-home" size="small" />
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

  function formatLabel (segment) {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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
    for (const [index, segment] of paths.entries()) {
      const path = '/' + paths.slice(0, index + 1).join('/')
      const isLast = index === paths.length - 1

      items.push({
        title: formatLabel(segment),
        to: path,
        disabled: isLast,
      })
    }

    return items
  })
</script>
