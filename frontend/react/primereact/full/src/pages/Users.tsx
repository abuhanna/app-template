import { useState, useEffect } from 'react'
import { DataTable, DataTableFilterMeta } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Dropdown } from 'primereact/dropdown'
import { Tag } from 'primereact/tag'
import { Card } from 'primereact/card'
import { Avatar } from 'primereact/avatar'
import { InputSwitch } from 'primereact/inputswitch'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { FilterMatchMode } from 'primereact/api'
import { ConfirmDialog } from '@/components'
import { useUserStore } from '@/stores/userStore'
import { useDepartmentStore } from '@/stores/departmentStore'
import { useNotificationStore } from '@/stores/notificationStore'
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types/user'

const roles = [
  { label: 'User', value: 'User' },
  { label: 'Admin', value: 'Admin' },
]

interface FormData {
  username: string
  email: string
  password: string
  name: string
  role: string
  departmentId?: string
  isActive: boolean
}

interface FormErrors {
  username: string
  email: string
  password: string
  role: string
}

export default function Users() {
  const { users, loading, fetchUsers, createUser, updateUser, deleteUser } = useUserStore()
  const { departments, fetchDepartments } = useDepartmentStore()
  const showSuccess = useNotificationStore((state) => state.showSuccess)

  const [dialogVisible, setDialogVisible] = useState(false)
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })
  const [globalFilterValue, setGlobalFilterValue] = useState('')

  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    name: '',
    role: 'User',
    departmentId: undefined,
    isActive: true,
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({
    username: '',
    email: '',
    password: '',
    role: '',
  })

  useEffect(() => {
    fetchUsers()
    fetchDepartments({ isActive: true, pageSize: 1000 })
  }, [fetchUsers, fetchDepartments])

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const _filters = { ...filters }
    ;(_filters['global'] as any).value = value
    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  const getInitials = (name: string | undefined, username: string): string => {
    const displayName = name || username
    return displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      name: '',
      role: 'User',
      departmentId: undefined,
      isActive: true,
    })
    setFormErrors({ username: '', email: '', password: '', role: '' })
  }

  const openCreateDialog = () => {
    resetForm()
    setIsEditing(false)
    setDialogVisible(true)
  }

  const openEditDialog = (user: User) => {
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      name: user.name || '',
      role: user.role,
      departmentId: user.departmentId,
      isActive: user.isActive,
    })
    setFormErrors({ username: '', email: '', password: '', role: '' })
    setSelectedUser(user)
    setIsEditing(true)
    setDialogVisible(true)
  }

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setDeleteDialogVisible(true)
  }

  const validate = (): boolean => {
    const errors: FormErrors = { username: '', email: '', password: '', role: '' }
    let valid = true

    if (!formData.username.trim()) {
      errors.username = 'Username is required'
      valid = false
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format'
      valid = false
    }

    if (!isEditing && !formData.password) {
      errors.password = 'Password is required'
      valid = false
    }

    if (!formData.role) {
      errors.role = 'Role is required'
      valid = false
    }

    setFormErrors(errors)
    return valid
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setSaving(true)
    try {
      if (isEditing && selectedUser) {
        const updateData: UpdateUserRequest = {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          departmentId: formData.departmentId,
          isActive: formData.isActive,
        }
        await updateUser(selectedUser.id, updateData)
        showSuccess('User updated successfully')
      } else {
        const createData: CreateUserRequest = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
          departmentId: formData.departmentId,
        }
        await createUser(createData)
        showSuccess('User created successfully')
      }
      setDialogVisible(false)
      await fetchUsers()
    } catch {
      // Error toast is shown automatically by API interceptor
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.id)
        showSuccess('User deleted successfully')
        setDeleteDialogVisible(false)
        await fetchUsers()
      } catch {
        // Error toast is shown automatically by API interceptor
      }
    }
  }

  const usernameTemplate = (user: User) => (
    <div className="flex align-items-center gap-3">
      <Avatar label={getInitials(user.name, user.username)} shape="circle" />
      <span>{user.username}</span>
    </div>
  )

  const statusTemplate = (user: User) => (
    <Tag
      value={user.isActive ? 'Active' : 'Inactive'}
      severity={user.isActive ? 'success' : 'secondary'}
    />
  )

  const roleTemplate = (user: User) => (
    <Tag value={user.role} severity={user.role === 'Admin' ? 'danger' : 'info'} />
  )

  const actionsTemplate = (user: User) => (
    <div className="flex gap-1">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="info"
        onClick={() => openEditDialog(user)}
        tooltip="Edit"
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        onClick={() => openDeleteDialog(user)}
        tooltip="Delete"
        tooltipOptions={{ position: 'top' }}
      />
    </div>
  )

  const departmentOptions = (departments || []).map((d) => ({ label: d.name, value: d.id }))

  const renderHeader = () => (
    <div className="flex flex-wrap align-items-center justify-content-between gap-2">
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Search users..."
          style={{ width: '20rem' }}
        />
      </IconField>
      <Button label="Add User" icon="pi pi-user-plus" onClick={openCreateDialog} />
    </div>
  )

  const emptyMessage = (
    <div className="flex flex-column align-items-center p-5 text-color-secondary">
      <i className="pi pi-users text-5xl mb-3"></i>
      <span>No users found</span>
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
          value={users}
          loading={loading}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          dataKey="id"
          filters={filters}
          filterDisplay="row"
          globalFilterFields={['username', 'email', 'name', 'role']}
          header={renderHeader()}
          emptyMessage={emptyMessage}
          stripedRows
        >
          <Column
            field="username"
            header="Username"
            body={usernameTemplate}
            sortable
            style={{ minWidth: '150px' }}
          />
          <Column field="email" header="Email" sortable style={{ minWidth: '200px' }} />
          <Column
            field="name"
            header="Name"
            sortable
            style={{ minWidth: '150px' }}
            body={(data) => data.name || '-'}
          />
          <Column
            field="departmentName"
            header="Department"
            sortable
            style={{ minWidth: '150px' }}
            body={(data) => data.departmentName || '-'}
          />
          <Column
            field="role"
            header="Role"
            body={roleTemplate}
            sortable
            style={{ minWidth: '100px' }}
          />
          <Column
            field="isActive"
            header="Status"
            body={statusTemplate}
            sortable
            style={{ minWidth: '100px' }}
          />
          <Column header="Actions" body={actionsTemplate} style={{ minWidth: '120px' }} />
        </DataTable>
      </Card>

      <Dialog
        header={isEditing ? 'Edit User' : 'Create User'}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        footer={dialogFooter}
        style={{ width: '32rem' }}
        modal
      >
        <div className="flex flex-column gap-4">
          <div className="flex flex-column gap-2">
            <label htmlFor="username">Username *</label>
            <InputText
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={isEditing}
              invalid={!!formErrors.username}
              placeholder="Enter username"
              className="w-full"
            />
            {formErrors.username && <small className="text-red-500">{formErrors.username}</small>}
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="email">Email *</label>
            <InputText
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              invalid={!!formErrors.email}
              placeholder="user@example.com"
              className="w-full"
            />
            {formErrors.email && <small className="text-red-500">{formErrors.email}</small>}
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="name">Name</label>
            <InputText
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full name"
              className="w-full"
            />
          </div>

          {!isEditing && (
            <div className="flex flex-column gap-2">
              <label htmlFor="password">Password *</label>
              <Password
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                invalid={!!formErrors.password}
                toggleMask
                placeholder="Minimum 6 characters"
                className="w-full"
                inputClassName="w-full"
              />
              {formErrors.password && <small className="text-red-500">{formErrors.password}</small>}
            </div>
          )}

          <div className="grid">
            <div className="col-6 flex flex-column gap-2">
              <label htmlFor="role">Role *</label>
              <Dropdown
                id="role"
                value={formData.role}
                options={roles}
                onChange={(e) => setFormData({ ...formData, role: e.value })}
                invalid={!!formErrors.role}
                placeholder="Select role"
                className="w-full"
              />
              {formErrors.role && <small className="text-red-500">{formErrors.role}</small>}
            </div>
            <div className="col-6 flex flex-column gap-2">
              <label htmlFor="department">Department</label>
              <Dropdown
                id="department"
                value={formData.departmentId}
                options={departmentOptions}
                onChange={(e) => setFormData({ ...formData, departmentId: e.value })}
                placeholder="Select department"
                showClear
                className="w-full"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex align-items-center gap-3">
              <InputSwitch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.value ?? false })}
              />
              <label>{formData.isActive ? 'Active' : 'Inactive'}</label>
            </div>
          )}
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
