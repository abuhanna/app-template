<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAuditLogs } from '@/services/auditLogService'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

const loading = ref(false)
const auditLogs = ref([])
const search = ref('')
const itemsPerPage = ref(10)

// Filters
const filters = ref({
  entityName: '',
  action: '',
  fromDate: null,
  toDate: null,
})

const entityNames = ['User', 'Department', 'UploadedFile']
const actions = ['Created', 'Updated', 'Deleted']

const headers = [
  { title: 'Entity', key: 'entityName', sortable: true },
  { title: 'Entity ID', key: 'entityId', sortable: true },
  { title: 'Action', key: 'action', sortable: true },
  { title: 'User ID', key: 'userId', sortable: true },
  { title: 'Timestamp', key: 'timestamp', sortable: true },
  { title: 'Details', key: 'actions', sortable: false, align: 'center' },
]

const filteredLogs = computed(() => {
  if (!search.value) return auditLogs.value
  const searchLower = search.value.toLowerCase()
  return auditLogs.value.filter(
    (log) =>
      log.entityName.toLowerCase().includes(searchLower) ||
      log.entityId.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower)
  )
})

async function loadAuditLogs() {
  loading.value = true
  try {
    const params = {}
    if (filters.value.entityName) params.entityName = filters.value.entityName
    if (filters.value.action) params.action = filters.value.action
    if (filters.value.fromDate) params.fromDate = filters.value.fromDate
    if (filters.value.toDate) params.toDate = filters.value.toDate

    auditLogs.value = await getAuditLogs(params)
  } catch {
    toastStore.showError('Failed to load audit logs')
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

function getActionColor(action) {
  switch (action?.toLowerCase()) {
    case 'created':
      return 'success'
    case 'updated':
      return 'info'
    case 'deleted':
      return 'error'
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
  <v-container fluid>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-history</v-icon>
        Audit Logs
        <v-spacer />
        <v-btn icon="mdi-refresh" variant="text" @click="loadAuditLogs" :loading="loading" />
      </v-card-title>

      <v-card-text>
        <!-- Filters -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.entityName"
              :items="entityNames"
              label="Entity"
              clearable
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.action"
              :items="actions"
              label="Action"
              clearable
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn color="primary" @click="loadAuditLogs" block>
              <v-icon left>mdi-filter</v-icon>
              Apply
            </v-btn>
          </v-col>
        </v-row>

        <!-- Data Table -->
        <v-data-table
          :headers="headers"
          :items="filteredLogs"
          :loading="loading"
          :items-per-page="itemsPerPage"
          class="elevation-1"
        >
          <template #item.action="{ item }">
            <v-chip :color="getActionColor(item.action)" size="small">
              {{ item.action }}
            </v-chip>
          </template>

          <template #item.userId="{ item }">
            {{ item.userId || '-' }}
          </template>

          <template #item.timestamp="{ item }">
            {{ formatDate(item.timestamp) }}
          </template>

          <template #item.actions="{ item }">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              @click="showDetails(item)"
            />
          </template>

          <template #no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-history</v-icon>
              <p class="text-grey mt-4">No audit logs found</p>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="800">
      <v-card v-if="selectedLog">
        <v-card-title>
          <v-icon class="mr-2">mdi-information</v-icon>
          Audit Log Details
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <strong>Entity:</strong> {{ selectedLog.entityName }}
            </v-col>
            <v-col cols="6">
              <strong>Entity ID:</strong> {{ selectedLog.entityId }}
            </v-col>
            <v-col cols="6">
              <strong>Action:</strong>
              <v-chip :color="getActionColor(selectedLog.action)" size="small" class="ml-2">
                {{ selectedLog.action }}
              </v-chip>
            </v-col>
            <v-col cols="6">
              <strong>User ID:</strong> {{ selectedLog.userId || '-' }}
            </v-col>
            <v-col cols="12">
              <strong>Timestamp:</strong> {{ formatDate(selectedLog.timestamp) }}
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-row v-if="selectedLog.oldValues">
            <v-col cols="12">
              <strong>Old Values:</strong>
              <v-sheet class="pa-3 mt-2 bg-grey-lighten-4 rounded" style="overflow-x: auto">
                <pre style="margin: 0; white-space: pre-wrap">{{ formatJson(selectedLog.oldValues) }}</pre>
              </v-sheet>
            </v-col>
          </v-row>

          <v-row v-if="selectedLog.newValues">
            <v-col cols="12">
              <strong>New Values:</strong>
              <v-sheet class="pa-3 mt-2 bg-grey-lighten-4 rounded" style="overflow-x: auto">
                <pre style="margin: 0; white-space: pre-wrap">{{ formatJson(selectedLog.newValues) }}</pre>
              </v-sheet>
            </v-col>
          </v-row>

          <v-row v-if="selectedLog.affectedColumns">
            <v-col cols="12">
              <strong>Affected Columns:</strong>
              <v-sheet class="pa-3 mt-2 bg-grey-lighten-4 rounded">
                <pre style="margin: 0">{{ formatJson(selectedLog.affectedColumns) }}</pre>
              </v-sheet>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="detailsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
