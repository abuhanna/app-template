<template>
  <div class="departments-page">
    <div class="page-header">
      <div>
        <h1>Department Management</h1>
        <p class="page-subtitle">Manage organizational departments</p>
      </div>
      <Button label="Add Department" icon="pi pi-plus" @click="openCreateDialog" />
    </div>

    <!-- Departments Table -->
    <Card>
      <template #content>
        <DataTable
          :value="departments"
          :loading="loading"
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 25, 50]"
          dataKey="id"
          filterDisplay="row"
          v-model:filters="filters"
          :globalFilterFields="['code', 'name']"
          responsiveLayout="scroll"
          class="departments-table"
        >
          <template #header>
            <div class="table-header">
              <IconField>
                <InputIcon class="pi pi-search" />
                <InputText
                  v-model="filters['global'].value"
                  placeholder="Search departments..."
                />
              </IconField>
            </div>
          </template>

          <template #empty>
            <div class="table-empty">
              <i class="pi pi-building"></i>
              <span>No departments found</span>
            </div>
          </template>

          <Column field="code" header="Code" sortable style="min-width: 120px">
            <template #body="{ data }">
              <Tag :value="data.code" severity="secondary" />
            </template>
          </Column>

          <Column field="name" header="Name" sortable style="min-width: 200px" />

          <Column field="description" header="Description" style="min-width: 300px">
            <template #body="{ data }">
              {{ data.description || '-' }}
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

          <Column field="createdAt" header="Created" sortable style="min-width: 150px">
            <template #body="{ data }">
              {{ formatDate(data.createdAt) }}
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
      :header="editingDepartment ? 'Edit Department' : 'Create Department'"
      :style="{ width: '500px' }"
      modal
      class="department-dialog"
    >
      <form @submit.prevent="handleSubmit" class="dialog-form">
        <div class="form-field">
          <label for="code">Code *</label>
          <InputText
            id="code"
            v-model="form.code"
            :disabled="!!editingDepartment"
            :invalid="!!formErrors.code"
            class="w-full"
            placeholder="e.g., IT, HR, FIN"
          />
          <small v-if="formErrors.code" class="p-error">{{ formErrors.code }}</small>
        </div>

        <div class="form-field">
          <label for="name">Name *</label>
          <InputText
            id="name"
            v-model="form.name"
            :invalid="!!formErrors.name"
            class="w-full"
            placeholder="e.g., Information Technology"
          />
          <small v-if="formErrors.name" class="p-error">{{ formErrors.name }}</small>
        </div>

        <div class="form-field">
          <label for="description">Description</label>
          <Textarea
            id="description"
            v-model="form.description"
            rows="3"
            class="w-full"
            placeholder="Optional description..."
          />
        </div>

        <div v-if="editingDepartment" class="form-field">
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
          :label="editingDepartment ? 'Update' : 'Create'"
          :loading="saving"
          @click="handleSubmit"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useDepartmentStore } from '@/stores/department'
import { useNotificationStore } from '@/stores/notification'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { FilterMatchMode } from '@primevue/core/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import ToggleSwitch from 'primevue/toggleswitch'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

const departmentStore = useDepartmentStore()
const notificationStore = useNotificationStore()
const { confirmDelete } = useConfirmDialog()

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingDepartment = ref(null)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const departments = computed(() => departmentStore.departments)

const form = reactive({
  code: '',
  name: '',
  description: '',
  isActive: true,
})

const formErrors = reactive({
  code: '',
  name: '',
})

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const resetForm = () => {
  form.code = ''
  form.name = ''
  form.description = ''
  form.isActive = true
  Object.keys(formErrors).forEach((key) => (formErrors[key] = ''))
}

const openCreateDialog = () => {
  editingDepartment.value = null
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (department) => {
  editingDepartment.value = department
  form.code = department.code
  form.name = department.name
  form.description = department.description || ''
  form.isActive = department.isActive
  Object.keys(formErrors).forEach((key) => (formErrors[key] = ''))
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
  editingDepartment.value = null
}

const validate = () => {
  let valid = true
  Object.keys(formErrors).forEach((key) => (formErrors[key] = ''))

  if (!form.code.trim()) {
    formErrors.code = 'Code is required'
    valid = false
  }

  if (!form.name.trim()) {
    formErrors.name = 'Name is required'
    valid = false
  }

  return valid
}

const handleSubmit = async () => {
  if (!validate()) return

  saving.value = true
  try {
    if (editingDepartment.value) {
      await departmentStore.updateDepartment(editingDepartment.value.id, {
        name: form.name,
        description: form.description,
        isActive: form.isActive,
      })
      notificationStore.success('Department updated successfully')
    } else {
      await departmentStore.createDepartment({
        code: form.code,
        name: form.name,
        description: form.description,
      })
      notificationStore.success('Department created successfully')
    }
    closeDialog()
  } catch (error) {
    notificationStore.error(error.response?.data?.message || 'Operation failed')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (department) => {
  const confirmed = await confirmDelete(department.name)
  if (!confirmed) return

  try {
    await departmentStore.deleteDepartment(department.id)
    notificationStore.success('Department deleted successfully')
  } catch (error) {
    notificationStore.error(error.response?.data?.message || 'Delete failed')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await departmentStore.fetchDepartments()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.departments-page {
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
