import { useState, useEffect } from 'react'
import { DataTable, DataTableFilterMeta } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { InputSwitch } from 'primereact/inputswitch'
import { Tag } from 'primereact/tag'
import { Card } from 'primereact/card'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { FilterMatchMode } from 'primereact/api'
import { ConfirmDialog } from '@/components'
import { useDepartmentStore } from '@/stores/departmentStore'
import { useNotificationStore } from '@/stores/notificationStore'
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '@/types/department'

interface FormData {
  name: string
  code: string
  description: string
  isActive: boolean
}

interface FormErrors {
  code: string
  name: string
}

export default function Departments() {
  const { departments, loading, fetchDepartments, createDepartment, updateDepartment, deleteDepartment } =
    useDepartmentStore()
  const showSuccess = useNotificationStore((state) => state.showSuccess)

  const [dialogVisible, setDialogVisible] = useState(false)
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })
  const [globalFilterValue, setGlobalFilterValue] = useState('')

  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    description: '',
    isActive: true,
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({
    code: '',
    name: '',
  })

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const _filters = { ...filters }
    ;(_filters['global'] as any).value = value
    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      isActive: true,
    })
    setFormErrors({ code: '', name: '' })
  }

  const openCreateDialog = () => {
    resetForm()
    setIsEditing(false)
    setDialogVisible(true)
  }

  const openEditDialog = (department: Department) => {
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || '',
      isActive: department.isActive,
    })
    setFormErrors({ code: '', name: '' })
    setSelectedDepartment(department)
    setIsEditing(true)
    setDialogVisible(true)
  }

  const openDeleteDialog = (department: Department) => {
    setSelectedDepartment(department)
    setDeleteDialogVisible(true)
  }

  const validate = (): boolean => {
    const errors: FormErrors = { code: '', name: '' }
    let valid = true

    if (!formData.code.trim()) {
      errors.code = 'Code is required'
      valid = false
    }

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
      valid = false
    }

    setFormErrors(errors)
    return valid
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setSaving(true)
    try {
      if (isEditing && selectedDepartment) {
        const updateData: UpdateDepartmentRequest = {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
        }
        await updateDepartment(selectedDepartment.id, updateData)
        showSuccess('Department updated successfully')
      } else {
        const createData: CreateDepartmentRequest = {
          code: formData.code,
          name: formData.name,
          description: formData.description,
        }
        await createDepartment(createData)
        showSuccess('Department created successfully')
      }
      setDialogVisible(false)
      await fetchDepartments()
    } catch {
      // Error toast is shown automatically by API interceptor
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (selectedDepartment) {
      try {
        await deleteDepartment(selectedDepartment.id)
        showSuccess('Department deleted successfully')
        setDeleteDialogVisible(false)
        await fetchDepartments()
      } catch {
        // Error toast is shown automatically by API interceptor
      }
    }
  }

  const codeTemplate = (department: Department) => (
    <Tag value={department.code} severity="secondary" />
  )

  const statusTemplate = (department: Department) => (
    <Tag
      value={department.isActive ? 'Active' : 'Inactive'}
      severity={department.isActive ? 'success' : 'secondary'}
    />
  )

  const actionsTemplate = (department: Department) => (
    <div className="flex gap-1">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="info"
        onClick={() => openEditDialog(department)}
        tooltip="Edit"
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        onClick={() => openDeleteDialog(department)}
        tooltip="Delete"
        tooltipOptions={{ position: 'top' }}
      />
    </div>
  )

  const renderHeader = () => (
    <div className="flex flex-wrap align-items-center justify-content-between gap-2">
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Search departments..."
          style={{ width: '20rem' }}
        />
      </IconField>
      <Button label="Add Department" icon="pi pi-building" onClick={openCreateDialog} />
    </div>
  )

  const emptyMessage = (
    <div className="flex flex-column align-items-center p-5 text-color-secondary">
      <i className="pi pi-building text-5xl mb-3"></i>
      <span>No departments found</span>
    </div>
  )

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancel" severity="secondary" onClick={() => setDialogVisible(false)} />
      <Button label={isEditing ? 'Update' : 'Create'} onClick={handleSubmit} loading={saving} />
    </div>
  )

  return (
    <div className="p-3">
      <Card>
        <DataTable
          value={departments}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          dataKey="id"
          filters={filters}
          filterDisplay="row"
          globalFilterFields={['code', 'name']}
          header={renderHeader()}
          emptyMessage={emptyMessage}
          stripedRows
        >
          <Column
            field="code"
            header="Code"
            body={codeTemplate}
            sortable
            style={{ minWidth: '120px' }}
          />
          <Column field="name" header="Name" sortable style={{ minWidth: '200px' }} />
          <Column
            field="description"
            header="Description"
            style={{ minWidth: '300px' }}
            body={(data) => data.description || '-'}
          />
          <Column
            field="isActive"
            header="Status"
            body={statusTemplate}
            sortable
            style={{ minWidth: '100px' }}
          />
          <Column
            field="createdAt"
            header="Created"
            sortable
            style={{ minWidth: '150px' }}
            body={(data) => formatDate(data.createdAt)}
          />
          <Column header="Actions" body={actionsTemplate} style={{ minWidth: '120px' }} />
        </DataTable>
      </Card>

      <Dialog
        header={isEditing ? 'Edit Department' : 'Create New Department'}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        footer={dialogFooter}
        style={{ width: '32rem' }}
        modal
      >
        <div className="flex flex-column gap-3">
          <div className="flex flex-column gap-2 mb-2">
            <label htmlFor="code">Code *</label>
            <InputText
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              disabled={isEditing}
              invalid={!!formErrors.code}
              placeholder="e.g., IT, HR, FIN"
              className="w-full"
            />
            {formErrors.code && <small className="text-red-500">{formErrors.code}</small>}
          </div>

          <div className="flex flex-column gap-2 mb-2">
            <label htmlFor="name">Name *</label>
            <InputText
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              invalid={!!formErrors.name}
              placeholder="e.g., Information Technology"
              className="w-full"
            />
            {formErrors.name && <small className="text-red-500">{formErrors.name}</small>}
          </div>

          <div className="flex flex-column gap-2 mb-2">
            <label htmlFor="description">Description</label>
            <InputTextarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Optional description..."
              className="w-full"
            />
          </div>

          {isEditing && (
            <div className="flex align-items-center gap-3">
              <InputSwitch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.value ?? false })}
              />
              <label>Status: {formData.isActive ? 'Active' : 'Inactive'}</label>
            </div>
          )}
        </div>
      </Dialog>

      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Delete Department"
        message={`Are you sure you want to delete department "${selectedDepartment?.name}"?`}
        confirmLabel="Delete"
        confirmSeverity="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogVisible(false)}
      />
    </div>
  )
}
