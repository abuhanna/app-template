import React, { useState, useEffect } from 'react'
import { Card } from 'primereact/card'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { authApi } from '@/services/authApi'

interface ProfileErrors {
  email: string
}

interface PasswordErrors {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function Profile() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const showSuccess = useNotificationStore((state) => state.showSuccess)

  const [profileForm, setProfileForm] = useState({
    email: '',
    name: '',
  })
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({ email: '' })
  const [savingProfile, setSavingProfile] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileForm({
        email: user.email || '',
        name: user.name || '',
      })
    }
  }, [user])

  const validateProfile = (): boolean => {
    const errors: ProfileErrors = { email: '' }
    let valid = true

    if (!profileForm.email.trim()) {
      errors.email = 'Email is required'
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      errors.email = 'Invalid email format'
      valid = false
    }

    setProfileErrors(errors)
    return valid
  }

  const validatePassword = (): boolean => {
    const errors: PasswordErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
    let valid = true

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required'
      valid = false
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required'
      valid = false
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters'
      valid = false
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password'
      valid = false
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
      valid = false
    }

    setPasswordErrors(errors)
    return valid
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateProfile()) return

    setSavingProfile(true)
    try {
      const updatedUser = await authApi.updateProfile({
        email: profileForm.email,
        name: profileForm.name,
      })
      setUser(updatedUser)
      showSuccess('Profile updated successfully')
    } catch {
      // Error toast is shown automatically by API interceptor
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePassword()) return

    setSavingPassword(true)
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      showSuccess('Password changed successfully')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordErrors({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch {
      // Error toast is shown automatically by API interceptor
    } finally {
      setSavingPassword(false)
    }
  }

  const profileTitle = (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-user text-primary"></i>
      <span>Profile Information</span>
    </div>
  )

  const passwordTitle = (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-lock text-primary"></i>
      <span>Change Password</span>
    </div>
  )

  return (
    <div className="flex flex-column gap-4 p-3">
      <div className="grid">
        {/* Profile Information */}
        <div className="col-12 md:col-6">
          <Card title={profileTitle} className="h-full">
            <form onSubmit={handleUpdateProfile} className="flex flex-column gap-3">
              <div className="flex flex-column gap-2">
                <label htmlFor="username" className="font-medium">
                  Username
                </label>
                <InputText id="username" value={user?.username || ''} disabled className="w-full" />
                <small className="text-color-secondary">Username cannot be changed</small>
              </div>

              <div className="flex flex-column gap-2">
                <label htmlFor="email" className="font-medium">
                  Email *
                </label>
                <InputText
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  invalid={!!profileErrors.email}
                  className="w-full"
                />
                {profileErrors.email && (
                  <small className="text-red-500">{profileErrors.email}</small>
                )}
              </div>

              <div className="flex flex-column gap-2">
                <label htmlFor="name" className="font-medium">
                  Name
                </label>
                <InputText
                  id="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full"
                />
              </div>

              <div className="flex flex-column gap-2">
                <label className="font-medium">Role</label>
                <div className="flex">
                  <Tag
                    value={user?.role || 'User'}
                    severity={user?.role === 'Admin' ? 'danger' : 'info'}
                  />
                </div>
              </div>

              <div className="flex flex-column gap-2">
                <label className="font-medium">Department</label>
                <span>{user?.departmentName || 'Not assigned'}</span>
              </div>

              <div className="mt-2">
                <Button
                  type="submit"
                  label="Update Profile"
                  loading={savingProfile}
                  icon="pi pi-check"
                />
              </div>
            </form>
          </Card>
        </div>

        {/* Change Password */}
        <div className="col-12 md:col-6">
          <Card title={passwordTitle} className="h-full">
            <form onSubmit={handleChangePassword} className="flex flex-column gap-3">
              <div className="flex flex-column gap-2">
                <label htmlFor="currentPassword" className="font-medium">
                  Current Password *
                </label>
                <Password
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  feedback={false}
                  toggleMask
                  invalid={!!passwordErrors.currentPassword}
                  inputClassName="w-full"
                  className="w-full"
                />
                {passwordErrors.currentPassword && (
                  <small className="text-red-500">{passwordErrors.currentPassword}</small>
                )}
              </div>

              <div className="flex flex-column gap-2">
                <label htmlFor="newPassword" className="font-medium">
                  New Password *
                </label>
                <Password
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  toggleMask
                  invalid={!!passwordErrors.newPassword}
                  inputClassName="w-full"
                  className="w-full"
                />
                {passwordErrors.newPassword && (
                  <small className="text-red-500">{passwordErrors.newPassword}</small>
                )}
              </div>

              <div className="flex flex-column gap-2">
                <label htmlFor="confirmPassword" className="font-medium">
                  Confirm New Password *
                </label>
                <Password
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  feedback={false}
                  toggleMask
                  invalid={!!passwordErrors.confirmPassword}
                  inputClassName="w-full"
                  className="w-full"
                />
                {passwordErrors.confirmPassword && (
                  <small className="text-red-500">{passwordErrors.confirmPassword}</small>
                )}
              </div>

              <div className="mt-2">
                <Button
                  type="submit"
                  label="Change Password"
                  loading={savingPassword}
                  icon="pi pi-lock"
                  severity="warning"
                />
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
