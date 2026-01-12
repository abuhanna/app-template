<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h4">Users</h1>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
          Add User
        </v-btn>
      </v-col>
    </v-row>

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
      <v-col cols="12" md="4">
        <v-select
          v-model="departmentFilter"
          :items="departmentOptions"
          label="Department"
          clearable
          hide-details
          density="compact"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          label="Status"
          clearable
          hide-details
          density="compact"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="filteredUsers"
          :loading="userStore.loading"
          hover
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
        </v-data-table>
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
            <v-text-field v-model="form.name" label="Full Name" />
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

const userStore = useUserStore()
const departmentStore = useDepartmentStore()
const notificationStore = useNotificationStore()
const { confirm } = useConfirmDialog()

const search = ref('')
const departmentFilter = ref(null)
const statusFilter = ref(null)
const dialog = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const formRef = ref(null)
const form = ref({
  id: null,
  username: '',
  email: '',
  password: '',
  name: '',
  role: 'User',
  departmentId: null,
  isActive: true
})

const headers = [
  { title: 'Username', key: 'username' },
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Department', key: 'departmentName' },
  { title: 'Status', key: 'isActive' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const statusOptions = [
  { title: 'Active', value: true },
  { title: 'Inactive', value: false }
]

const departmentOptions = computed(() =>
  departmentStore.items.map(d => ({ title: d.name, value: d.id }))
)

const filteredUsers = computed(() => {
  let result = userStore.items

  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(u =>
      u.username?.toLowerCase().includes(s) ||
      u.name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s)
    )
  }

  if (departmentFilter.value) {
    result = result.filter(u => u.departmentId === departmentFilter.value)
  }

  if (statusFilter.value !== null) {
    result = result.filter(u => u.isActive === statusFilter.value)
  }

  return result
})

const openCreateDialog = () => {
  isEditing.value = false
  form.value = {
    id: null,
    username: '',
    email: '',
    password: '',
    name: '',
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
    name: user.name,
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
        name: form.value.name,
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
    await userStore.fetchUsers()
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
      await userStore.fetchUsers()
    } catch (error) {
      notificationStore.showError(error.message || 'Failed to deactivate user')
    }
  }
}

onMounted(async () => {
  await Promise.all([
    userStore.fetchUsers(),
    departmentStore.fetchDepartments()
  ])
})
</script>
