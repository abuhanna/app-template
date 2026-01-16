import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Dropdown } from 'primereact/dropdown'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { ConfirmDialog } from '@/components'
import { useUserStore } from '@/stores/userStore'
import { useDepartmentStore } from '@/stores/departmentStore'
import { useNotificationStore } from '@/stores/notificationStore'
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types/user'

const roles = [
  { label: 'User', value: 'User' },
  { label: 'Admin', value: 'Admin' },
]

export default function Users() {
  const toast = useRef<Toast>(null)
  const users = useUserStore((state) => state.users)
  const loading = useUserStore((state) => state.loading)
  const fetchUsers = useUserStore((state) => state.fetchUsers)
  const createUser = useUserStore((state) => state.createUser)
  const updateUser = useUserStore((state) => state.updateUser)
  const deleteUser = useUserStore((state) => state.deleteUser)

  const departments = useDepartmentStore((state) => state.departments)
  const fetchDepartments = useDepartmentStore((state) => state.fetchDepartments)

  const showNotification = useNotificationStore((state) => state.showNotification)

  const [dialogVisible, setDialogVisible] = useState(false)
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState<CreateUserRequest & { password: string }>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'User',
    departmentId: undefined,
  })

  useEffect(() => {
    fetchUsers()
    fetchDepartments()
  }, [fetchUsers, fetchDepartments])

  const openCreateDialog = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'User',
      departmentId: undefined,
    })
    setIsEditing(false)
    setDialogVisible(true)
  }

  const openEditDialog = (user: User) => {
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      departmentId: user.departmentId,
    })
    setSelectedUser(user)
    setIsEditing(true)
    setDialogVisible(true)
  }

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setDeleteDialogVisible(true)
  }

  const handleSubmit = async () => {
    try {
      if (isEditing && selectedUser) {
        const updateData: UpdateUserRequest = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          departmentId: formData.departmentId,
        }
        await updateUser(selectedUser.id, updateData)
        showNotification('User updated successfully', 'success')
      } else {
        await createUser(formData)
        showNotification('User created successfully', 'success')
      }
      setDialogVisible(false)
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Operation failed', 'error')
    }
  }

  const handleDelete = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.id)
        showNotification('User deleted successfully', 'success')
        setDeleteDialogVisible(false)
      } catch (error: any) {
        showNotification(error.response?.data?.message || 'Failed to delete user', 'error')
      }
    }
  }

  const statusTemplate = (user: User) => (
    <Tag value={user.isActive ? 'Active' : 'Inactive'} severity={user.isActive ? 'success' : 'danger'} />
  )

  const roleTemplate = (user: User) => (
    <Tag value={user.role} severity={user.role === 'Admin' ? 'warning' : 'info'} />
  )

  const actionsTemplate = (user: User) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => openEditDialog(user)} />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => openDeleteDialog(user)} />
    </div>
  )

  const departmentOptions = departments.map((d) => ({ label: d.name, value: d.id }))

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
        <div className="text-3xl font-bold">Users</div>
        <Button label="Add User" icon="pi pi-plus" onClick={openCreateDialog} />
      </div>

      <DataTable value={users} loading={loading} paginator rows={10} stripedRows>
        <Column field="username" header="Username" sortable />
        <Column field="email" header="Email" sortable />
        <Column field="firstName" header="First Name" sortable />
        <Column field="lastName" header="Last Name" sortable />
        <Column field="departmentName" header="Department" sortable />
        <Column field="role" header="Role" body={roleTemplate} sortable />
        <Column field="isActive" header="Status" body={statusTemplate} sortable />
        <Column header="Actions" body={actionsTemplate} style={{ width: '120px' }} />
      </DataTable>

      <Dialog
        header={isEditing ? 'Edit User' : 'Create User'}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        footer={dialogFooter}
        style={{ width: '500px' }}
      >
        <div className="flex flex-column gap-4">
          <div>
            <label htmlFor="username" className="block text-900 font-medium mb-2">
              Username
            </label>
            <InputText
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full"
              disabled={isEditing}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-900 font-medium mb-2">
              Email
            </label>
            <InputText
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full"
            />
          </div>

          {!isEditing && (
            <div>
              <label htmlFor="password" className="block text-900 font-medium mb-2">
                Password
              </label>
              <Password
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full"
                inputClassName="w-full"
                toggleMask
              />
            </div>
          )}

          <div className="grid">
            <div className="col-6">
              <label htmlFor="firstName" className="block text-900 font-medium mb-2">
                First Name
              </label>
              <InputText
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="col-6">
              <label htmlFor="lastName" className="block text-900 font-medium mb-2">
                Last Name
              </label>
              <InputText
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-900 font-medium mb-2">
              Role
            </label>
            <Dropdown
              id="role"
              value={formData.role}
              options={roles}
              onChange={(e) => setFormData({ ...formData, role: e.value })}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-900 font-medium mb-2">
              Department
            </label>
            <Dropdown
              id="department"
              value={formData.departmentId}
              options={departmentOptions}
              onChange={(e) => setFormData({ ...formData, departmentId: e.value })}
              className="w-full"
              placeholder="Select a department"
              showClear
            />
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Delete User"
        message={`Are you sure you want to delete user "${selectedUser?.username}"?`}
        confirmLabel="Delete"
        confirmSeverity="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogVisible(false)}
      />
    </div>
  )
}
