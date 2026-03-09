<template>
  <div class="users-page">

    <!-- Users Table -->
    <Card>
      <template #content>
        <DataTable
          v-model:filters="filters"
          class="users-table"
          data-key="id"
          filter-display="row"
          :global-filter-fields="['username', 'email', 'name', 'role']"
          :loading="loading"
          paginator
          responsive-layout="scroll"
          :rows="10"
          :rows-per-page-options="[5, 10, 25, 50]"
          :value="users"
        >
          <template #header>
            <div class="flex flex-wrap align-items-center justify-content-between gap-2">
              <IconField>
                <InputIcon class="pi pi-search" />
                <InputText
                  v-model="filters['global'].value"
                  class="w-20rem"
                  placeholder="Search users..."
                />
              </IconField>
              <Button icon="pi pi-user-plus" label="Add User" @click="openCreateDialog" />
            </div>
          </template>

          <template #empty>
            <div class="table-empty">
              <i class="pi pi-users" />
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
              <Tag :severity="data.role === 'admin' ? 'danger' : 'info'" :value="data.role" />
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
                :severity="data.isActive ? 'success' : 'secondary'"
                :value="data.isActive ? 'Active' : 'Inactive'"
              />
            </template>
          </Column>

          <Column header="Actions" style="min-width: 120px">
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  v-tooltip.top="'Edit'"
                  icon="pi pi-pencil"
                  rounded
                  severity="info"
                  text
                  @click="openEditDialog(data)"
                />
                <Button
                  v-tooltip.top="'Delete'"
                  icon="pi pi-trash"
                  rounded
                  severity="danger"
                  text
                  @click="handleDelete(data)"
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
      modal
      :style="{ width: '32rem' }"
    >
      <div class="flex flex-column gap-4">
        <div class="flex flex-column gap-2">
          <label for="username">Username *</label>
          <InputText
            id="username"
            v-model="form.username"
            class="w-full"
            :disabled="!!editingUser"
            :invalid="!!formErrors.username"
            placeholder="Enter username"
          />
          <small v-if="formErrors.username" class="text-red-500">{{ formErrors.username }}</small>
        </div>

        <div class="flex flex-column gap-2">
          <label for="email">Email *</label>
          <InputText
            id="email"
            v-model="form.email"
            class="w-full"
            :invalid="!!formErrors.email"
            placeholder="user@example.com"
            type="email"
          />
          <small v-if="formErrors.email" class="text-red-500">{{ formErrors.email }}</small>
        </div>

        <div class="grid">
          <div class="col-6 flex flex-column gap-2">
            <label for="firstName">First Name</label>
            <InputText id="firstName" v-model="form.firstName" class="w-full" placeholder="John" />
          </div>
          <div class="col-6 flex flex-column gap-2">
            <label for="lastName">Last Name</label>
            <InputText id="lastName" v-model="form.lastName" class="w-full" placeholder="Doe" />
          </div>
        </div>

        <div v-if="!editingUser" class="flex flex-column gap-2">
          <label for="password">Password *</label>
          <Password
            id="password"
            v-model="form.password"
            class="w-full"
            fluid
            :invalid="!!formErrors.password"
            placeholder="Minimum 6 characters"
            toggle-mask
          />
          <small v-if="formErrors.password" class="text-red-500">{{ formErrors.password }}</small>
        </div>

        <div class="grid">
          <div class="col-6 flex flex-column gap-2">
            <label for="role">Role *</label>
            <Select
              id="role"
              v-model="form.role"
              class="w-full"
              :invalid="!!formErrors.role"
              option-label="label"
              option-value="value"
              :options="roleOptions"
              placeholder="Select role"
            />
            <small v-if="formErrors.role" class="text-red-500">{{ formErrors.role }}</small>
          </div>
          <div class="col-6 flex flex-column gap-2">
            <label for="department">Department</label>
            <Select
              id="department"
              v-model="form.departmentId"
              class="w-full"
              option-label="name"
              option-value="id"
              :options="departmentOptions"
              placeholder="Select department"
              show-clear
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
  import { FilterMatchMode } from '@primevue/core/api'
  import Avatar from 'primevue/avatar'
  import Button from 'primevue/button'
  import Card from 'primevue/card'
  import Column from 'primevue/column'
  import DataTable from 'primevue/datatable'
  import Dialog from 'primevue/dialog'
  import IconField from 'primevue/iconfield'
  import InputIcon from 'primevue/inputicon'
  import InputText from 'primevue/inputtext'
  import Password from 'primevue/password'
  import Select from 'primevue/select'
  import Tag from 'primevue/tag'
  import ToggleSwitch from 'primevue/toggleswitch'
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useConfirmDialog } from '@/composables/useConfirmDialog'
  import { useDepartmentStore } from '@/stores/department'
  import { useNotificationStore } from '@/stores/notification'
  import { useUserStore } from '@/stores/user'

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
    { label: 'user', value: 'user' },
    { label: 'admin', value: 'admin' },
  ]

  const form = reactive({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'user',
    departmentId: null,
    isActive: true,
  })

  const formErrors = reactive({
    username: '',
    email: '',
    password: '',
    role: '',
  })

  function getInitials (name) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  function resetForm () {
    form.username = ''
    form.email = ''
    form.firstName = ''
    form.lastName = ''
    form.password = ''
    form.role = 'user'
    form.departmentId = null
    form.isActive = true
    for (const key of Object.keys(formErrors)) (formErrors[key] = '')
  }

  function openCreateDialog () {
    editingUser.value = null
    resetForm()
    dialogVisible.value = true
  }

  function openEditDialog (user) {
    editingUser.value = user
    form.username = user.username
    form.email = user.email
    form.firstName = user.firstName || ''
    form.lastName = user.lastName || ''
    form.role = user.role
    form.departmentId = user.departmentId
    form.isActive = user.isActive
    for (const key of Object.keys(formErrors)) (formErrors[key] = '')
    dialogVisible.value = true
  }

  function closeDialog () {
    dialogVisible.value = false
    editingUser.value = null
  }

  function validate () {
    let valid = true
    for (const key of Object.keys(formErrors)) (formErrors[key] = '')

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

  async function handleSubmit () {
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

  async function handleDelete (user) {
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
      await Promise.all([userStore.fetchUsers(), departmentStore.fetchDepartments({ isActive: true, pageSize: 1000 })])
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
