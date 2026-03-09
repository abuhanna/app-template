<script setup>
  import { FilterMatchMode } from '@primevue/core/api'
  import { useToast } from 'primevue/usetoast'
  import { computed, onMounted, ref } from 'vue'
  import { getAuditLogs } from '@/services/auditLogService'

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

  async function loadAuditLogs () {
    loading.value = true
    try {
      const params = {}
      if (entityFilter.value) params.entityType = entityFilter.value
      if (actionFilter.value) params.action = actionFilter.value
      const response = await getAuditLogs(params)
      // Handle paginated response envelope: { success, data: [...], pagination: {...} }
      if (response && response.data !== undefined) {
        auditLogs.value = Array.isArray(response.data) ? response.data : []
      } else {
        auditLogs.value = Array.isArray(response) ? response : []
      }
    } catch {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load audit logs', life: 3000 })
    } finally {
      loading.value = false
    }
  }

  function formatDate (dateString) {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getActionSeverity (action) {
    switch (action?.toLowerCase()) {
      case 'created': {
        return 'success'
      }
      case 'updated': {
        return 'info'
      }
      case 'deleted': {
        return 'danger'
      }
      default: {
        return 'secondary'
      }
    }
  }

  function formatJson (jsonString) {
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

  function showDetails (log) {
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
          data-key="id"
          :filters="filters"
          :global-filter-fields="['entityType', 'entityId', 'action']"
          :loading="loading"
          paginator
          :rows="10"
          :rows-per-page-options="[5, 10, 25, 50]"
          striped-rows
          :value="auditLogs"
        >
          <template #header>
            <div class="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">

              <div class="flex flex-wrap gap-2">
                <Select
                  v-model="entityFilter"
                  class="w-12rem"
                  :options="entityOptions"
                  placeholder="Filter by Entity"
                  show-clear
                />
                <Select
                  v-model="actionFilter"
                  class="w-12rem"
                  :options="actionOptions"
                  placeholder="Filter by Action"
                  show-clear
                />
                <IconField>
                  <InputIcon class="pi pi-search" />
                  <InputText v-model="filters['global'].value" placeholder="Search..." />
                </IconField>
                <Button icon="pi pi-filter" label="Apply" text @click="loadAuditLogs" />
                <Button
                  icon="pi pi-refresh"
                  :loading="loading"
                  rounded
                  text
                  @click="loadAuditLogs"
                />
              </div>
            </div>
          </template>

          <Column field="entityType" header="Entity" sortable style="min-width: 120px" />
          <Column field="entityId" header="Entity ID" sortable style="min-width: 100px" />
          <Column field="action" header="Action" sortable style="min-width: 100px">
            <template #body="{ data }">
              <Tag :severity="getActionSeverity(data.action)" :value="data.action" />
            </template>
          </Column>
          <Column field="userName" header="User" sortable style="min-width: 100px">
            <template #body="{ data }">
              {{ data.userName || '-' }}
            </template>
          </Column>
          <Column field="createdAt" header="Date" sortable style="min-width: 180px">
            <template #body="{ data }">
              {{ formatDate(data.createdAt) }}
            </template>
          </Column>
          <Column header="Details" style="min-width: 80px">
            <template #body="{ data }">
              <Button icon="pi pi-eye" rounded text @click="showDetails(data)" />
            </template>
          </Column>

          <template #empty>
            <div class="flex flex-column align-items-center py-5 text-color-secondary">
              <i class="pi pi-history text-5xl mb-3" />
              <span>No audit logs found</span>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <!-- Details Dialog -->
    <Dialog v-model:visible="detailsDialog" header="Audit Log Details" modal :style="{ width: '50rem' }">
      <div v-if="selectedLog" class="flex flex-column gap-3">
        <div class="grid">
          <div class="col-6">
            <strong>Entity:</strong> {{ selectedLog.entityType }}
          </div>
          <div class="col-6">
            <strong>Entity ID:</strong> {{ selectedLog.entityId }}
          </div>
          <div class="col-6">
            <strong>Action:</strong>
            <Tag class="ml-2" :severity="getActionSeverity(selectedLog.action)" :value="selectedLog.action" />
          </div>
          <div class="col-6">
            <strong>User:</strong> {{ selectedLog.userName || '-' }}
          </div>
          <div class="col-12">
            <strong>Date:</strong> {{ formatDate(selectedLog.createdAt) }}
          </div>
        </div>

        <Divider />

        <div v-if="selectedLog.details">
          <strong>Details:</strong>
          <div class="surface-100 p-3 border-round mt-2" style="overflow-x: auto">
            <pre style="margin: 0; white-space: pre-wrap">{{ selectedLog.details }}</pre>
          </div>
        </div>

        <div v-if="selectedLog.ipAddress">
          <strong>IP Address:</strong> {{ selectedLog.ipAddress }}
        </div>
      </div>

      <template #footer>
        <Button label="Close" @click="detailsDialog = false" />
      </template>
    </Dialog>
  </div>
</template>
