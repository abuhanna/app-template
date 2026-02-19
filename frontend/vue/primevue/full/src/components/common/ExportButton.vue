<template>
  <div class="export-button-wrapper">
    <Button
      type="button"
      :loading="loading"
      :disabled="disabled"
      icon="pi pi-download"
      label="Export"
      outlined
      severity="primary"
      @click="toggleMenu"
    />
    <Menu ref="menuRef" :model="menuItems" :popup="true" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import Button from 'primevue/button'
import Menu from 'primevue/menu'

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
const menuRef = ref()
const loading = ref(false)

const menuItems = computed(() => [
  {
    label: 'Export Format',
    items: [
      {
        label: 'Excel (.xlsx)',
        icon: 'pi pi-file-excel',
        command: () => handleExport('xlsx'),
      },
      {
        label: 'CSV (.csv)',
        icon: 'pi pi-file',
        command: () => handleExport('csv'),
      },
      {
        label: 'PDF Report (.pdf)',
        icon: 'pi pi-file-pdf',
        command: () => handleExport('pdf'),
      },
    ],
  },
])

function toggleMenu(event) {
  menuRef.value.toggle(event)
}

async function handleExport(format) {
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

<style scoped>
.export-button-wrapper {
  display: inline-block;
}
</style>
