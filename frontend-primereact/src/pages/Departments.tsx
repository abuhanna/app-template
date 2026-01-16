import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { InputSwitch } from 'primereact/inputswitch'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { ConfirmDialog } from '@/components'
import { useDepartmentStore } from '@/stores/departmentStore'
import { useNotificationStore } from '@/stores/notificationStore'
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '@/types/department'

export default function Departments() {
  const toast = useRef<Toast>(null)
  const departments = useDepartmentStore((state) => state.departments)
  const loading = useDepartmentStore((state) => state.loading)
  const fetchDepartments = useDepartmentStore((state) => state.fetchDepartments)
  const createDepartment = useDepartmentStore((state) => state.createDepartment)
  const updateDepartment = useDepartmentStore((state) => state.updateDepartment)
  const deleteDepartment = useDepartmentStore((state) => state.deleteDepartment)

  const showNotification = useNotificationStore((state) => state.showNotification)

  const [dialogVisible, setDialogVisible] = useState(false)
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState<CreateDepartmentRequest & { isActive: boolean }>({
    name: '',
    code: '',
    description: '',
    isActive: true,
  })

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  const openCreateDialog = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      isActive: true,
    })
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
    setSelectedDepartment(department)
    setIsEditing(true)
    setDialogVisible(true)
  }

  const openDeleteDialog = (department: Department) => {
    setSelectedDepartment(department)
    setDeleteDialogVisible(true)
  }

  const handleSubmit = async () => {
    try {
      if (isEditing && selectedDepartment) {
        const updateData: UpdateDepartmentRequest = {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
        }
        await updateDepartment(selectedDepartment.id, updateData)
        showNotification('Department updated successfully', 'success')
      } else {
        await createDepartment(formData)
        showNotification('Department created successfully', 'success')
      }
      setDialogVisible(false)
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Operation failed', 'error')
    }
  }

  const handleDelete = async () => {
    if (selectedDepartment) {
      try {
        await deleteDepartment(selectedDepartment.id)
        showNotification('Department deleted successfully', 'success')
        setDeleteDialogVisible(false)
      } catch (error: any) {
        showNotification(error.response?.data?.message || 'Failed to delete department', 'error')
      }
    }
  }

  const statusTemplate = (department: Department) => (
    <Tag
      value={department.isActive ? 'Active' : 'Inactive'}
      severity={department.isActive ? 'success' : 'danger'}
    />
  )

  const actionsTemplate = (department: Department) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="info"
        onClick={() => openEditDialog(department)}
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        onClick={() => openDeleteDialog(department)}
      />
    </div>
  )

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancel" text onClick={() => setDialogVisible(false)} />
      <Button label={isEditing ? 'Update' : 'Create'} onClick={handleSubmit} />
    </div>
  )

  return (
    <div>
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-4">
        <div className="text-3xl font-bold">Departments</div>
        <Button label="Add Department" icon="pi pi-plus" onClick={openCreateDialog} />
      </div>

      <DataTable value={departments} loading={loading} paginator rows={10} stripedRows>
        <Column field="code" header="Code" sortable />
        <Column field="name" header="Name" sortable />
        <Column field="description" header="Description" />
        <Column field="isActive" header="Status" body={statusTemplate} sortable />
        <Column header="Actions" body={actionsTemplate} style={{ width: '120px' }} />
      </DataTable>

      <Dialog
        header={isEditing ? 'Edit Department' : 'Create Department'}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        footer={dialogFooter}
        style={{ width: '500px' }}
      >
        <div className="flex flex-column gap-4">
          <div>
            <label htmlFor="code" className="block text-900 font-medium mb-2">
              Code
            </label>
            <InputText
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full"
              disabled={isEditing}
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-900 font-medium mb-2">
              Name
            </label>
            <InputText
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-900 font-medium mb-2">
              Description
            </label>
            <InputTextarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full"
              rows={3}
            />
          </div>

          {isEditing && (
            <div className="flex align-items-center gap-2">
              <InputSwitch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.value ?? false })}
              />
              <label className="text-900 font-medium">Active</label>
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
