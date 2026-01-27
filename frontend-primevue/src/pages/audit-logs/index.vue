<script setup>
import { ref, onMounted, computed } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import { getAuditLogs } from '@/services/auditLogService'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const loading = ref(false)
const auditLogs = ref([])

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// Filter options
const entityFilter = ref(null)
const actionFilter = ref(null)
const entityOptions = ['User', 'Department', 'UploadedFile']
const actionOptions = ['Created', 'Updated', 'Deleted']

async function loadAuditLogs() {
  loading.value = true
  try {
    const params = {}
    if (entityFilter.value) params.entityName = entityFilter.value
    if (actionFilter.value) params.action = actionFilter.value
    const response = await getAuditLogs(params)
    auditLogs.value = response.items || []
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load audit logs', life: 3000 })
  } finally {
    loading.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getActionSeverity(action) {
  switch (action?.toLowerCase()) {
    case 'created':
      return 'success'
    case 'updated':
      return 'info'
    case 'deleted':
      return 'danger'
    default:
      return 'secondary'
  }
}

function formatJson(jsonString) {
  if (!jsonString) return null
  try {
    return JSON.stringify(JSON.parse(jsonString), null, 2)
  } catch {
    return jsonString
  }
}

// Details dialog
const detailsDialog = ref(false)
const selectedLog = ref(null)

function showDetails(log) {
  selectedLog.value = log
  detailsDialog.value = true
}

onMounted(() => {
  loadAuditLogs()
})
</script>

<template>
  <div class="p-4">
    <Card>
      <template #content>
        <DataTable
          :value="auditLogs"
          :loading="loading"
          :filters="filters"
          :globalFilterFields="['entityName', 'entityId', 'action']"
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 25, 50]"
          stripedRows
          dataKey="id"
        >
          <template #header>
            <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">

              <div class="flex flex-wrap gap-2">
                 <Select
                  v-model="entityFilter"
                  :options="entityOptions"
                  placeholder="Filter by Entity"
                  showClear
                  class="w-12rem"
                />
                <Select
                  v-model="actionFilter"
                  :options="actionOptions"
                  placeholder="Filter by Action"
                  showClear
                  class="w-12rem"
                />
                <IconField>
                  <InputIcon class="pi pi-search" />
                  <InputText v-model="filters['global'].value" placeholder="Search..." />
                </IconField>
                <Button label="Apply" icon="pi pi-filter" @click="loadAuditLogs" text />
                 <Button icon="pi pi-refresh" text rounded @click="loadAuditLogs" :loading="loading" />
              </div>
            </div>
          </template>

          <Column field="entityName" header="Entity" sortable style="min-width: 120px" />
          <Column field="entityId" header="Entity ID" sortable style="min-width: 100px" />
          <Column field="action" header="Action" sortable style="min-width: 100px">
            <template #body="{ data }">
              <Tag :value="data.action" :severity="getActionSeverity(data.action)" />
            </template>
          </Column>
          <Column field="userId" header="User ID" sortable style="min-width: 100px">
            <template #body="{ data }">
              {{ data.userId || '-' }}
            </template>
          </Column>
          <Column field="timestamp" header="Timestamp" sortable style="min-width: 180px">
            <template #body="{ data }">
              {{ formatDate(data.timestamp) }}
            </template>
          </Column>
          <Column header="Details" style="min-width: 80px">
            <template #body="{ data }">
              <Button icon="pi pi-eye" text rounded @click="showDetails(data)" />
            </template>
          </Column>

          <template #empty>
            <div class="flex flex-column align-items-center py-5 text-color-secondary">
              <i class="pi pi-history text-5xl mb-3"></i>
              <span>No audit logs found</span>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <!-- Details Dialog -->
    <Dialog v-model:visible="detailsDialog" header="Audit Log Details" :style="{ width: '50rem' }" modal>
      <div v-if="selectedLog" class="flex flex-column gap-3">
        <div class="grid">
          <div class="col-6">
            <strong>Entity:</strong> {{ selectedLog.entityName }}
          </div>
          <div class="col-6">
            <strong>Entity ID:</strong> {{ selectedLog.entityId }}
          </div>
          <div class="col-6">
            <strong>Action:</strong>
            <Tag :value="selectedLog.action" :severity="getActionSeverity(selectedLog.action)" class="ml-2" />
          </div>
          <div class="col-6">
            <strong>User ID:</strong> {{ selectedLog.userId || '-' }}
          </div>
          <div class="col-12">
            <strong>Timestamp:</strong> {{ formatDate(selectedLog.timestamp) }}
          </div>
        </div>

        <Divider />

        <div v-if="selectedLog.oldValues">
          <strong>Old Values:</strong>
          <div class="surface-100 p-3 border-round mt-2" style="overflow-x: auto">
            <pre style="margin: 0; white-space: pre-wrap">{{ formatJson(selectedLog.oldValues) }}</pre>
          </div>
        </div>

        <div v-if="selectedLog.newValues">
          <strong>New Values:</strong>
          <div class="surface-100 p-3 border-round mt-2" style="overflow-x: auto">
            <pre style="margin: 0; white-space: pre-wrap">{{ formatJson(selectedLog.newValues) }}</pre>
          </div>
        </div>

        <div v-if="selectedLog.affectedColumns">
          <strong>Affected Columns:</strong>
          <div class="surface-100 p-3 border-round mt-2">
            <pre style="margin: 0">{{ formatJson(selectedLog.affectedColumns) }}</pre>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Close" @click="detailsDialog = false" />
      </template>
    </Dialog>
  </div>
</template>
