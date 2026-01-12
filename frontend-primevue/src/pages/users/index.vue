<template>
  <div class="users-page">
    <div class="page-header">
      <div>
        <h1>User Management</h1>
        <p class="page-subtitle">Manage system users and their permissions</p>
      </div>
      <Button label="Add User" icon="pi pi-plus" @click="openCreateDialog" />
    </div>

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
            <div class="table-header">
              <IconField>
                <InputIcon class="pi pi-search" />
                <InputText
                  v-model="filters['global'].value"
                  placeholder="Search users..."
                />
              </IconField>
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

          <Column field="name" header="Name" sortable style="min-width: 150px">
            <template #body="{ data }">
              {{ data.name || '-' }}
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
      :style="{ width: '500px' }"
      modal
      class="user-dialog"
    >
      <form @submit.prevent="handleSubmit" class="dialog-form">
        <div class="form-field">
          <label for="username">Username *</label>
          <InputText
            id="username"
            v-model="form.username"
            :disabled="!!editingUser"
            :invalid="!!formErrors.username"
            class="w-full"
          />
          <small v-if="formErrors.username" class="p-error">{{ formErrors.username }}</small>
        </div>

        <div class="form-field">
          <label for="email">Email *</label>
          <InputText
            id="email"
            v-model="form.email"
            type="email"
            :invalid="!!formErrors.email"
            class="w-full"
          />
          <small v-if="formErrors.email" class="p-error">{{ formErrors.email }}</small>
        </div>

        <div class="form-field">
          <label for="name">Name</label>
          <InputText id="name" v-model="form.name" class="w-full" />
        </div>

        <div v-if="!editingUser" class="form-field">
          <label for="password">Password *</label>
          <Password
            id="password"
            v-model="form.password"
            :invalid="!!formErrors.password"
            toggleMask
            inputClass="w-full"
            class="w-full"
          />
          <small v-if="formErrors.password" class="p-error">{{ formErrors.password }}</small>
        </div>

        <div class="form-field">
          <label for="role">Role *</label>
          <Select
            id="role"
            v-model="form.role"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            :invalid="!!formErrors.role"
            class="w-full"
          />
          <small v-if="formErrors.role" class="p-error">{{ formErrors.role }}</small>
        </div>

        <div class="form-field">
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

        <div v-if="editingUser" class="form-field">
          <label for="isActive">Status</label>
          <div class="flex align-items-center gap-2">
            <ToggleSwitch id="isActive" v-model="form.isActive" />
            <span>{{ form.isActive ? 'Active' : 'Inactive' }}</span>
          </div>
        </div>
      </form>

      <template #footer>
        <Button label="Cancel" text @click="closeDialog" />
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
  name: '',
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
  form.name = ''
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
  form.name = user.name || ''
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
        name: form.name,
        role: form.role,
        departmentId: form.departmentId,
        isActive: form.isActive,
      })
      notificationStore.success('User updated successfully')
    } else {
      await userStore.createUser({
        username: form.username,
        email: form.email,
        name: form.name,
        password: form.password,
        role: form.role,
        departmentId: form.departmentId,
      })
      notificationStore.success('User created successfully')
    }
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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-header h1 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.page-subtitle {
  margin: 0;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
}

.table-header {
  display: flex;
  justify-content: flex-end;
}

.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--p-text-muted-color);
  gap: 0.5rem;
}

.table-empty i {
  font-size: 2.5rem;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--p-text-color);
}

.w-full {
  width: 100%;
}

.flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
