<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom end">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        :loading="loading"
        :disabled="disabled"
        variant="outlined"
        color="primary"
        prepend-icon="mdi-download"
      >
        Export
        <v-icon end>mdi-chevron-down</v-icon>
      </v-btn>
    </template>

    <v-card min-width="200">
      <v-list density="compact">
        <v-list-subheader>Export Format</v-list-subheader>

        <v-list-item
          v-for="format in formats"
          :key="format.value"
          :prepend-icon="format.icon"
          :title="format.label"
          @click="handleExport(format.value)"
        />
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup>
import { ref } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const props = defineProps({
  exportFn: {
    type: Function,
    required: true,
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['export-start', 'export-complete', 'export-error'])

const notificationStore = useNotificationStore()
const menu = ref(false)
const loading = ref(false)

const formats = [
  { value: 'xlsx', label: 'Excel (.xlsx)', icon: 'mdi-file-excel' },
  { value: 'csv', label: 'CSV (.csv)', icon: 'mdi-file-delimited' },
  { value: 'pdf', label: 'PDF Report (.pdf)', icon: 'mdi-file-pdf-box' },
]

async function handleExport(format) {
  menu.value = false
  loading.value = true
  emit('export-start', format)

  try {
    const result = await props.exportFn(format, props.filters)
    notificationStore.showSuccess(`Exported successfully: ${result.fileName}`)
    emit('export-complete', result)
  } catch (error) {
    console.error('Export failed:', error)
    notificationStore.showError('Export failed. Please try again.')
    emit('export-error', error)
  } finally {
    loading.value = false
  }
}
</script>
