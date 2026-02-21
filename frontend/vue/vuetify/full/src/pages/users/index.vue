<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <div class="text-body-2 text-medium-emphasis">
          {{ pagination.totalItems > 0 ? `Showing ${(pagination.page - 1) * pagination.pageSize + 1} - ${Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} of ${pagination.totalItems} users` : 'No users found' }}
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
          Add User
        </v-btn>
      </v-col>
    </v-row>

    <!-- Search and Filter Bar -->
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search users..."
          clearable
          hide-details
          density="compact"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="departmentFilter"
          :items="departmentOptions"
          label="Department"
          clearable
          hide-details
          density="compact"
          @update:model-value="loadUsers"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          label="Status"
          clearable
          hide-details
          density="compact"
          @update:model-value="loadUsers"
        />
      </v-col>
      <v-col cols="12" md="2" class="d-flex align-center">
        <v-btn
          v-if="hasActiveFilters"
          variant="text"
          size="small"
          @click="clearFilters"
        >
          Clear Filters
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table-server
          v-model:items-per-page="pagination.pageSize"
          v-model:page="pagination.page"
          v-model:sort-by="sortBy"
          :headers="headers"
          :items="userStore.items"
          :items-length="pagination.totalItems"
          :loading="userStore.loading"
          hover
          @update:options="handleTableOptions"
        >
          <template #item.isActive="{ item }">
            <v-chip :color="item.isActive ? 'success' : 'error'" size="small">
              {{ item.isActive ? 'Active' : 'Inactive' }}
            </v-chip>
          </template>
          <template #item.actions="{ item }">
            <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEditDialog(item)" />
            <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="confirmDelete(item)" />
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
                @update:model-value="loadUsers"
              />
              <v-pagination
                v-model="pagination.page"
                :length="pagination.totalPages"
                :total-visible="5"
                density="compact"
                @update:model-value="loadUsers"
              />
            </div>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>{{ isEditing ? 'Edit User' : 'Create User' }}</v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-text-field
              v-model="form.username"
              label="Username"
              :disabled="isEditing"
              :rules="[v => !!v || 'Username is required']"
            />
            <v-text-field
              v-model="form.email"
              label="Email"
              type="email"
              :rules="[v => !!v || 'Email is required', v => /.+@.+/.test(v) || 'Invalid email']"
            />
            <v-text-field
              v-if="!isEditing"
              v-model="form.password"
              label="Password"
              type="password"
              :rules="[v => !!v || 'Password is required', v => v.length >= 6 || 'Min 6 characters']"
            />
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.firstName" label="First Name" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.lastName" label="Last Name" />
              </v-col>
            </v-row>
            <v-select
              v-model="form.role"
              :items="['Admin', 'User', 'Manager']"
              label="Role"
            />
            <v-select
              v-model="form.departmentId"
              :items="departmentStore.items"
              item-title="name"
              item-value="id"
              label="Department"
              clearable
            />
            <v-switch
              v-if="isEditing"
              v-model="form.isActive"
              label="Active"
              color="success"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveUser">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useDepartmentStore } from '@/stores/department'
import { useNotificationStore } from '@/stores/notification'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useDebounce } from '@/composables/useDebounce'
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/types'

const userStore = useUserStore()
const departmentStore = useDepartmentStore()
const notificationStore = useNotificationStore()
const { confirm } = useConfirmDialog()

// Pagination state
const pagination = ref({
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  totalItems: 0,
  totalPages: 0
})
const pageSizeOptions = PAGE_SIZE_OPTIONS

// Sort state
const sortBy = ref([{ key: 'createdAt', order: 'desc' }])

// Filter state
const search = ref('')
const debouncedSearch = useDebounce(search, 300)
const departmentFilter = ref(null)
const statusFilter = ref(null)

// Dialog state
const dialog = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const formRef = ref(null)
const form = ref({
  id: null,
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'User',
  departmentId: null,
  isActive: true
})

const headers = [
  { title: 'Username', key: 'username', sortable: true },
  { title: 'Name', key: 'fullName', sortable: false },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Role', key: 'role', sortable: true },
  { title: 'Department', key: 'departmentName', sortable: false },
  { title: 'Status', key: 'isActive', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const statusOptions = [
  { title: 'Active', value: true },
  { title: 'Inactive', value: false }
]

const departmentOptions = computed(() =>
  departmentStore.items.map(d => ({ title: d.name, value: d.id }))
)

const hasActiveFilters = computed(() =>
  search.value || departmentFilter.value !== null || statusFilter.value !== null
)

// Load users with current pagination and filters
const loadUsers = async () => {
  const sort = sortBy.value[0]
  await userStore.fetchUsers({
    page: pagination.value.page,
    pageSize: pagination.value.pageSize,
    sortBy: sort?.key || 'createdAt',
    sortDir: sort?.order || 'desc',
    search: debouncedSearch.value || undefined,
    departmentId: departmentFilter.value || undefined,
    isActive: statusFilter.value
  })

  // Update pagination from store
  if (userStore.pagination) {
    pagination.value.totalItems = userStore.pagination.totalItems
    pagination.value.totalPages = userStore.pagination.totalPages
  }
}

// Handle table options change (sort, page, etc.)
const handleTableOptions = (options) => {
  if (options.sortBy && options.sortBy.length > 0) {
    sortBy.value = options.sortBy
  }
  loadUsers()
}

const clearFilters = () => {
  search.value = ''
  departmentFilter.value = null
  statusFilter.value = null
  pagination.value.page = 1
  loadUsers()
}

const openCreateDialog = () => {
  isEditing.value = false
  form.value = {
    id: null,
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'User',
    departmentId: null,
    isActive: true
  }
  dialog.value = true
}

const openEditDialog = (user) => {
  isEditing.value = true
  form.value = {
    id: user.id,
    username: user.username,
    email: user.email,
    password: '',
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    departmentId: user.departmentId,
    isActive: user.isActive
  }
  dialog.value = true
}

const saveUser = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    if (isEditing.value) {
      await userStore.updateUser(form.value.id, {
        email: form.value.email,
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        role: form.value.role,
        departmentId: form.value.departmentId,
        isActive: form.value.isActive
      })
      notificationStore.showSuccess('User updated successfully')
    } else {
      await userStore.createUser(form.value)
      notificationStore.showSuccess('User created successfully')
    }
    dialog.value = false
    await loadUsers()
  } catch (error) {
    notificationStore.showError(error.message || 'Failed to save user')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (user) => {
  const confirmed = await confirm({
    title: 'Deactivate User',
    message: `Are you sure you want to deactivate ${user.username}?`,
    icon: 'mdi-account-off',
    color: 'error'
  })

  if (confirmed) {
    try {
      await userStore.deleteUser(user.id)
      notificationStore.showSuccess('User deactivated successfully')
      await loadUsers()
    } catch (error) {
      notificationStore.showError(error.message || 'Failed to deactivate user')
    }
  }
}

// Watch for debounced search changes
watch(debouncedSearch, () => {
  pagination.value.page = 1
  loadUsers()
})

onMounted(async () => {
  await Promise.all([
    loadUsers(),
    departmentStore.fetchDepartments({ isActive: true, pageSize: 1000 })
  ])
})
</script>
