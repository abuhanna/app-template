<template>
  <div class="users-page">


    <!-- Users Table -->
    <Card>
      <template #content>
        <DataTable
          :value="users"
          :loading="loading"
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 25, 50]"
          dataKey="id"
          filterDisplay="row"
          v-model:filters="filters"
          :globalFilterFields="['username', 'email', 'name', 'role']"
          responsiveLayout="scroll"
          class="users-table"
        >
          <template #header>
            <div class="flex flex-wrap align-items-center justify-content-between gap-2">
              <IconField>
                <InputIcon class="pi pi-search" />
                <InputText
                  v-model="filters['global'].value"
                  placeholder="Search users..."
                  class="w-20rem"
                />
              </IconField>
              <Button label="Add User" icon="pi pi-user-plus" @click="openCreateDialog" />
            </div>
          </template>

          <template #empty>
            <div class="table-empty">
              <i class="pi pi-users"></i>
              <span>No users found</span>
            </div>
          </template>

          <Column field="username" header="Username" sortable style="min-width: 150px">
            <template #body="{ data }">
              <div class="user-cell">
                <Avatar :label="getInitials(data.name || data.username)" shape="circle" />
                <span>{{ data.username }}</span>
              </div>
            </template>
          </Column>

          <Column field="email" header="Email" sortable style="min-width: 200px" />

          <Column field="firstName" header="First Name" sortable style="min-width: 150px">
            <template #body="{ data }">
              {{ data.firstName || '-' }}
            </template>
          </Column>

          <Column field="lastName" header="Last Name" sortable style="min-width: 150px">
            <template #body="{ data }">
              {{ data.lastName || '-' }}
            </template>
          </Column>

          <Column field="role" header="Role" sortable style="min-width: 100px">
            <template #body="{ data }">
              <Tag :value="data.role" :severity="data.role === 'Admin' ? 'danger' : 'info'" />
            </template>
          </Column>

          <Column field="departmentName" header="Department" sortable style="min-width: 150px">
            <template #body="{ data }">
              {{ data.departmentName || '-' }}
            </template>
          </Column>

          <Column field="isActive" header="Status" sortable style="min-width: 100px">
            <template #body="{ data }">
              <Tag
                :value="data.isActive ? 'Active' : 'Inactive'"
                :severity="data.isActive ? 'success' : 'secondary'"
              />
            </template>
          </Column>

          <Column header="Actions" style="min-width: 120px">
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  severity="info"
                  @click="openEditDialog(data)"
                  v-tooltip.top="'Edit'"
                />
                <Button
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="danger"
                  @click="handleDelete(data)"
                  v-tooltip.top="'Delete'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="editingUser ? 'Edit User' : 'Create User'"
      :style="{ width: '32rem' }"
      modal
    >
      <div class="flex flex-column gap-4">
        <div class="flex flex-column gap-2">
          <label for="username">Username *</label>
          <InputText
            id="username"
            v-model="form.username"
            :disabled="!!editingUser"
            :invalid="!!formErrors.username"
            placeholder="Enter username"
            class="w-full"
          />
          <small v-if="formErrors.username" class="text-red-500">{{ formErrors.username }}</small>
        </div>

        <div class="flex flex-column gap-2">
          <label for="email">Email *</label>
          <InputText
            id="email"
            v-model="form.email"
            type="email"
            :invalid="!!formErrors.email"
            placeholder="user@example.com"
            class="w-full"
          />
          <small v-if="formErrors.email" class="text-red-500">{{ formErrors.email }}</small>
        </div>

        <div class="grid">
          <div class="col-6 flex flex-column gap-2">
            <label for="firstName">First Name</label>
            <InputText id="firstName" v-model="form.firstName" placeholder="John" class="w-full" />
          </div>
          <div class="col-6 flex flex-column gap-2">
            <label for="lastName">Last Name</label>
            <InputText id="lastName" v-model="form.lastName" placeholder="Doe" class="w-full" />
          </div>
        </div>

        <div v-if="!editingUser" class="flex flex-column gap-2">
          <label for="password">Password *</label>
          <Password
            id="password"
            v-model="form.password"
            :invalid="!!formErrors.password"
            toggleMask
            placeholder="Minimum 6 characters"
            fluid
            class="w-full"
          />
          <small v-if="formErrors.password" class="text-red-500">{{ formErrors.password }}</small>
        </div>

        <div class="grid">
          <div class="col-6 flex flex-column gap-2">
            <label for="role">Role *</label>
            <Select
              id="role"
              v-model="form.role"
              :options="roleOptions"
              optionLabel="label"
              optionValue="value"
              :invalid="!!formErrors.role"
              placeholder="Select role"
              class="w-full"
            />
            <small v-if="formErrors.role" class="text-red-500">{{ formErrors.role }}</small>
          </div>
          <div class="col-6 flex flex-column gap-2">
            <label for="department">Department</label>
            <Select
              id="department"
              v-model="form.departmentId"
              :options="departmentOptions"
              optionLabel="name"
              optionValue="id"
              placeholder="Select department"
              showClear
              class="w-full"
            />
          </div>
        </div>

        <div v-if="editingUser" class="flex align-items-center gap-3">
          <ToggleSwitch id="isActive" v-model="form.isActive" />
          <label for="isActive">{{ form.isActive ? 'Active' : 'Inactive' }}</label>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" severity="secondary" @click="closeDialog" />
        <Button
          :label="editingUser ? 'Update' : 'Create'"
          :loading="saving"
          @click="handleSubmit"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useDepartmentStore } from '@/stores/department'
import { useNotificationStore } from '@/stores/notification'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { FilterMatchMode } from '@primevue/core/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import ToggleSwitch from 'primevue/toggleswitch'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

const userStore = useUserStore()
const departmentStore = useDepartmentStore()
const notificationStore = useNotificationStore()
const { confirmDelete } = useConfirmDialog()

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingUser = ref(null)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const users = computed(() => userStore.users)
const departmentOptions = computed(() => departmentStore.departments)

const roleOptions = [
  { label: 'User', value: 'User' },
  { label: 'Admin', value: 'Admin' },
]

const form = reactive({
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  role: 'User',
  departmentId: null,
  isActive: true,
})

const formErrors = reactive({
  username: '',
  email: '',
  password: '',
  role: '',
})

const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const resetForm = () => {
  form.username = ''
  form.email = ''
  form.firstName = ''
  form.lastName = ''
  form.password = ''
  form.role = 'User'
  form.departmentId = null
  form.isActive = true
  Object.keys(formErrors).forEach((key) => (formErrors[key] = ''))
}

const openCreateDialog = () => {
  editingUser.value = null
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (user) => {
  editingUser.value = user
  form.username = user.username
  form.email = user.email
  form.firstName = user.firstName || ''
  form.lastName = user.lastName || ''
  form.role = user.role
  form.departmentId = user.departmentId
  form.isActive = user.isActive
  Object.keys(formErrors).forEach((key) => (formErrors[key] = ''))
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
  editingUser.value = null
}

const validate = () => {
  let valid = true
  Object.keys(formErrors).forEach((key) => (formErrors[key] = ''))

  if (!form.username.trim()) {
    formErrors.username = 'Username is required'
    valid = false
  }

  if (!form.email.trim()) {
    formErrors.email = 'Email is required'
    valid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    formErrors.email = 'Invalid email format'
    valid = false
  }

  if (!editingUser.value && !form.password) {
    formErrors.password = 'Password is required'
    valid = false
  }

  if (!form.role) {
    formErrors.role = 'Role is required'
    valid = false
  }

  return valid
}

const handleSubmit = async () => {
  if (!validate()) return

  saving.value = true
  try {
    if (editingUser.value) {
      await userStore.updateUser(editingUser.value.id, {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
        departmentId: form.departmentId,
        isActive: form.isActive,
      })
      notificationStore.success('User updated successfully')
    } else {
      await userStore.createUser({
        username: form.username,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        password: form.password,
        role: form.role,
        departmentId: form.departmentId,
      })
      notificationStore.success('User created successfully')
    }
    await userStore.fetchUsers()
    closeDialog()
  } catch (error) {
    notificationStore.error(error.response?.data?.message || 'Operation failed')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (user) => {
  const confirmed = await confirmDelete(user.username)
  if (!confirmed) return

  try {
    await userStore.deleteUser(user.id)
    notificationStore.success('User deleted successfully')
    await userStore.fetchUsers()
  } catch (error) {
    notificationStore.error(error.response?.data?.message || 'Delete failed')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([userStore.fetchUsers(), departmentStore.fetchDepartments()])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.users-page {
  padding: 1rem;
}



/* Empty state styling */
.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  gap: 0.5rem;
  color: var(--p-text-muted-color);
}

.table-empty i {
  font-size: 3rem;
}

/* User cell with avatar */
.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Action buttons layout */
.action-buttons {
  display: flex;
  gap: 0.25rem;
}

/* Error text styling */
.text-red-500 {
  color: var(--p-red-500);
}
</style>

