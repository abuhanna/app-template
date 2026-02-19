<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" class="d-flex justify-end">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
          Add Department
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search departments..."
          clearable
          hide-details
          density="compact"
        />
      </v-col>
      <v-col cols="12" md="6">
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
          :items="filteredDepartments"
          :loading="departmentStore.loading"
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
        <v-card-title>{{ isEditing ? 'Edit Department' : 'Create Department' }}</v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-text-field
              v-model="form.code"
              label="Code"
              :rules="[v => !!v || 'Code is required']"
            />
            <v-text-field
              v-model="form.name"
              label="Name"
              :rules="[v => !!v || 'Name is required']"
            />
            <v-textarea
              v-model="form.description"
              label="Description"
              rows="3"
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
          <v-btn color="primary" :loading="saving" @click="saveDepartment">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { useDepartmentStore } from '@/stores/department'
import { useNotificationStore } from '@/stores/notification'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const departmentStore = useDepartmentStore()
const notificationStore = useNotificationStore()
const { confirm } = useConfirmDialog()

const search = ref('')
const statusFilter = ref(null)
const dialog = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const formRef = ref(null)
const form = ref({
  id: null,
  code: '',
  name: '',
  description: '',
  isActive: true
})

const headers = [
  { title: 'Code', key: 'code' },
  { title: 'Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Status', key: 'isActive' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const statusOptions = [
  { title: 'Active', value: true },
  { title: 'Inactive', value: false }
]

const filteredDepartments = computed(() => {
  let result = departmentStore.items

  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(d =>
      d.code?.toLowerCase().includes(s) ||
      d.name?.toLowerCase().includes(s)
    )
  }

  if (statusFilter.value !== null) {
    result = result.filter(d => d.isActive === statusFilter.value)
  }

  return result
})

const openCreateDialog = () => {
  isEditing.value = false
  form.value = {
    id: null,
    code: '',
    name: '',
    description: '',
    isActive: true
  }
  dialog.value = true
}

const openEditDialog = (department) => {
  isEditing.value = true
  form.value = {
    id: department.id,
    code: department.code,
    name: department.name,
    description: department.description,
    isActive: department.isActive
  }
  dialog.value = true
}

const saveDepartment = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    if (isEditing.value) {
      await departmentStore.updateDepartment(form.value.id, {
        code: form.value.code,
        name: form.value.name,
        description: form.value.description,
        isActive: form.value.isActive
      })
      notificationStore.showSuccess('Department updated successfully')
    } else {
      await departmentStore.createDepartment(form.value)
      notificationStore.showSuccess('Department created successfully')
    }
    dialog.value = false
    await departmentStore.fetchDepartments()
  } catch (error) {
    notificationStore.showError(error.message || 'Failed to save department')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (department) => {
  const confirmed = await confirm({
    title: 'Deactivate Department',
    message: `Are you sure you want to deactivate ${department.name}?`,
    icon: 'mdi-office-building-remove',
    color: 'error'
  })

  if (confirmed) {
    try {
      await departmentStore.deleteDepartment(department.id)
      notificationStore.showSuccess('Department deactivated successfully')
      await departmentStore.fetchDepartments()
    } catch (error) {
      notificationStore.showError(error.message || 'Failed to deactivate department')
    }
  }
}

onMounted(async () => {
  await departmentStore.fetchDepartments()
})
</script>
