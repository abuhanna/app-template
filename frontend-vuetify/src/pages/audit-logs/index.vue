<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { getAuditLogs } from '@/services/auditLogService'
import { useToastStore } from '@/stores/toast'
import { useDebounce } from '@/composables/useDebounce'
import { DateRangePicker } from '@/components/common'
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/types'

const toastStore = useToastStore()

const loading = ref(false)
const auditLogs = ref([])

// Pagination state
const pagination = ref({
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  totalItems: 0,
  totalPages: 0
})
const pageSizeOptions = PAGE_SIZE_OPTIONS

// Sort state
const sortBy = ref([{ key: 'timestamp', order: 'desc' }])

// Search and filters
const search = ref('')
const debouncedSearch = useDebounce(search, 300)
const filters = ref({
  entityName: null,
  action: null
})
const dateRange = ref({
  from: '',
  to: ''
})

const entityNames = ['User', 'Department', 'UploadedFile']
const actions = ['Created', 'Updated', 'Deleted']

const headers = [
  { title: 'Entity', key: 'entityName', sortable: true },
  { title: 'Entity ID', key: 'entityId', sortable: true },
  { title: 'Action', key: 'action', sortable: true },
  { title: 'User ID', key: 'userId', sortable: true },
  { title: 'Timestamp', key: 'timestamp', sortable: true },
  { title: 'Details', key: 'actions', sortable: false, align: 'center' }
]

const hasActiveFilters = computed(() =>
  search.value ||
  filters.value.entityName ||
  filters.value.action ||
  dateRange.value.from ||
  dateRange.value.to
)

async function loadAuditLogs() {
  loading.value = true
  try {
    const sort = sortBy.value[0]
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      sortBy: sort?.key || 'timestamp',
      sortDir: sort?.order || 'desc'
    }

    if (debouncedSearch.value) params.search = debouncedSearch.value
    if (filters.value.entityName) params.entityName = filters.value.entityName
    if (filters.value.action) params.action = filters.value.action
    if (dateRange.value.from) params.fromDate = dateRange.value.from
    if (dateRange.value.to) params.toDate = dateRange.value.to

    const result = await getAuditLogs(params)

    // Handle paginated response
    if (result.items && result.pagination) {
      auditLogs.value = result.items
      pagination.value.totalItems = result.pagination.totalItems
      pagination.value.totalPages = result.pagination.totalPages
    } else {
      // Fallback for non-paginated response
      auditLogs.value = Array.isArray(result) ? result : []
    }
  } catch {
    toastStore.showError('Failed to load audit logs')
  } finally {
    loading.value = false
  }
}

function handleTableOptions(options) {
  if (options.sortBy && options.sortBy.length > 0) {
    sortBy.value = options.sortBy
  }
  loadAuditLogs()
}

function clearFilters() {
  search.value = ''
  filters.value.entityName = null
  filters.value.action = null
  dateRange.value = { from: '', to: '' }
  pagination.value.page = 1
  loadAuditLogs()
}

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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

// Watch for debounced search changes
watch(debouncedSearch, () => {
  pagination.value.page = 1
  loadAuditLogs()
})

// Watch for date range changes
watch(dateRange, () => {
  pagination.value.page = 1
  loadAuditLogs()
}, { deep: true })

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
        <div class="text-body-2 text-medium-emphasis mr-4">
          {{ pagination.totalItems > 0 ? `${pagination.totalItems} records` : '' }}
        </div>
        <v-btn icon="mdi-refresh" variant="text" @click="loadAuditLogs" :loading="loading" />
      </v-card-title>

      <v-card-text>
        <!-- Filters -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search..."
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.entityName"
              :items="entityNames"
              label="Entity"
              clearable
              density="compact"
              hide-details
              @update:model-value="() => { pagination.page = 1; loadAuditLogs() }"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.action"
              :items="actions"
              label="Action"
              clearable
              density="compact"
              hide-details
              @update:model-value="() => { pagination.page = 1; loadAuditLogs() }"
            />
          </v-col>
          <v-col cols="12" md="4">
            <DateRangePicker v-model="dateRange" />
          </v-col>
          <v-col cols="12" md="1" class="d-flex align-center">
            <v-btn
              v-if="hasActiveFilters"
              variant="text"
              size="small"
              @click="clearFilters"
            >
              Clear
            </v-btn>
          </v-col>
        </v-row>

        <!-- Data Table -->
        <v-data-table-server
          v-model:items-per-page="pagination.pageSize"
          v-model:page="pagination.page"
          v-model:sort-by="sortBy"
          :headers="headers"
          :items="auditLogs"
          :items-length="pagination.totalItems"
          :loading="loading"
          class="elevation-1"
          @update:options="handleTableOptions"
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

          <template #bottom>
            <div class="d-flex align-center justify-space-between pa-4">
              <v-select
                v-model="pagination.pageSize"
                :items="pageSizeOptions"
                label="Items per page"
                density="compact"
                hide-details
                style="max-width: 120px"
                @update:model-value="loadAuditLogs"
              />
              <v-pagination
                v-model="pagination.page"
                :length="pagination.totalPages"
                :total-visible="5"
                density="compact"
                @update:model-value="loadAuditLogs"
              />
            </div>
          </template>
        </v-data-table-server>
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
