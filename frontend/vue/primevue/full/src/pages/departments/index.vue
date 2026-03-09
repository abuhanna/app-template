<template>
  <div class="departments-page">

    <!-- Departments Table -->
    <Card>
      <template #content>
        <DataTable
          v-model:filters="filters"
          class="departments-table"
          data-key="id"
          filter-display="row"
          :global-filter-fields="['code', 'name']"
          :loading="loading"
          paginator
          responsive-layout="scroll"
          :rows="10"
          :rows-per-page-options="[5, 10, 25, 50]"
          :value="departments"
        >
          <template #header>
            <div class="flex flex-wrap align-items-center justify-content-between gap-2">
              <IconField>
                <InputIcon class="pi pi-search" />
                <InputText
                  v-model="filters['global'].value"
                  class="w-20rem"
                  placeholder="Search departments..."
                />
              </IconField>
              <Button icon="pi pi-building" label="Add Department" @click="openCreateDialog" />
            </div>
          </template>

          <template #empty>
            <div class="table-empty">
              <i class="pi pi-building" />
              <span>No departments found</span>
            </div>
          </template>

          <Column field="code" header="Code" sortable style="min-width: 120px">
            <template #body="{ data }">
              <Tag severity="secondary" :value="data.code" />
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
                :severity="data.isActive ? 'success' : 'secondary'"
                :value="data.isActive ? 'Active' : 'Inactive'"
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
      :header="editingDepartment ? 'Edit Department' : 'Create New Department'"
      modal
      :style="{ width: '32rem' }"
    >
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-2 mb-4">
          <label for="code">Code *</label>
          <InputText
            id="code"
            v-model="form.code"
            class="w-full"
            :disabled="!!editingDepartment"
            :invalid="!!formErrors.code"
            placeholder="e.g., IT, HR, FIN"
          />
          <small v-if="formErrors.code" class="text-red-500">{{ formErrors.code }}</small>
        </div>

        <div class="flex flex-column gap-2 mb-4">
          <label for="name">Name *</label>
          <InputText
            id="name"
            v-model="form.name"
            class="w-full"
            :invalid="!!formErrors.name"
            placeholder="e.g., Information Technology"
          />
          <small v-if="formErrors.name" class="text-red-500">{{ formErrors.name }}</small>
        </div>

        <div class="flex flex-column gap-2 mb-4">
          <label for="description">Description</label>
          <Textarea
            id="description"
            v-model="form.description"
            class="w-full"
            placeholder="Optional description..."
            rows="3"
          />
        </div>

        <div v-if="editingDepartment" class="flex align-items-center gap-2">
          <ToggleSwitch id="isActive" v-model="form.isActive" />
          <label for="isActive">Status: {{ form.isActive ? 'Active' : 'Inactive' }}</label>
        </div>

      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="closeDialog" />
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
  import { FilterMatchMode } from '@primevue/core/api'
  import Button from 'primevue/button'
  import Card from 'primevue/card'
  import Column from 'primevue/column'
  import DataTable from 'primevue/datatable'
  import Dialog from 'primevue/dialog'
  import IconField from 'primevue/iconfield'
  import InputIcon from 'primevue/inputicon'
  import InputText from 'primevue/inputtext'
  import Tag from 'primevue/tag'
  import Textarea from 'primevue/textarea'
  import ToggleSwitch from 'primevue/toggleswitch'
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useConfirmDialog } from '@/composables/useConfirmDialog'
  import { useDepartmentStore } from '@/stores/department'
  import { useNotificationStore } from '@/stores/notification'

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

  function formatDate (dateString) {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  function resetForm () {
    form.code = ''
    form.name = ''
    form.description = ''
    form.isActive = true
    for (const key of Object.keys(formErrors)) (formErrors[key] = '')
  }

  function openCreateDialog () {
    editingDepartment.value = null
    resetForm()
    dialogVisible.value = true
  }

  function openEditDialog (department) {
    editingDepartment.value = department
    form.code = department.code
    form.name = department.name
    form.description = department.description || ''
    form.isActive = department.isActive
    for (const key of Object.keys(formErrors)) (formErrors[key] = '')
    dialogVisible.value = true
  }

  function closeDialog () {
    dialogVisible.value = false
    editingDepartment.value = null
  }

  function validate () {
    let valid = true
    for (const key of Object.keys(formErrors)) (formErrors[key] = '')

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

  async function handleSubmit () {
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
      await departmentStore.fetchDepartments()
      closeDialog()
    } catch (error) {
      notificationStore.error(error.response?.data?.message || 'Operation failed')
    } finally {
      saving.value = false
    }
  }

  async function handleDelete (department) {
    const confirmed = await confirmDelete(department.name)
    if (!confirmed) return

    try {
      await departmentStore.deleteDepartment(department.id)
      notificationStore.success('Department deleted successfully')
      await departmentStore.fetchDepartments()
    } catch {
    // Error toast handled by store
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
  padding: 1rem;
}

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

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.text-red-500 {
  color: var(--p-red-500);
}
</style>
