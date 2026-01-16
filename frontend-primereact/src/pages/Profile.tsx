import { useState } from 'react'
import { Card } from 'primereact/card'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { Message } from 'primereact/message'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { userApi } from '@/services/userApi'
import { authApi } from '@/services/authApi'

export default function Profile() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const showNotification = useNotificationStore((state) => state.showNotification)

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileLoading(true)

    try {
      const updatedUser = await userApi.updateMyProfile(profileData)
      setUser(updatedUser)
      showNotification('Profile updated successfully', 'success')
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    setPasswordLoading(true)

    try {
      await authApi.changePassword(passwordData.currentPassword, passwordData.newPassword)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showNotification('Password changed successfully', 'success')
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div>
      <div className="text-3xl font-bold mb-4">Profile</div>

      <div className="grid">
        <div className="col-12 lg:col-6">
          <Card title="Profile Information">
            {profileError && (
              <Message severity="error" text={profileError} className="w-full mb-4" />
            )}

            <form onSubmit={handleProfileSubmit}>
              <div className="mb-4">
                <label htmlFor="firstName" className="block text-900 font-medium mb-2">
                  First Name
                </label>
                <InputText
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="lastName" className="block text-900 font-medium mb-2">
                  Last Name
                </label>
                <InputText
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-900 font-medium mb-2">
                  Email
                </label>
                <InputText
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-900 font-medium mb-2">Username</label>
                <InputText value={user?.username || ''} className="w-full" disabled />
                <small className="text-500">Username cannot be changed</small>
              </div>

              <div className="mb-4">
                <label className="block text-900 font-medium mb-2">Department</label>
                <InputText value={user?.departmentName || 'Not Assigned'} className="w-full" disabled />
              </div>

              <Button
                type="submit"
                label="Update Profile"
                icon="pi pi-check"
                loading={profileLoading}
              />
            </form>
          </Card>
        </div>

        <div className="col-12 lg:col-6">
          <Card title="Change Password">
            {passwordError && (
              <Message severity="error" text={passwordError} className="w-full mb-4" />
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-900 font-medium mb-2">
                  Current Password
                </label>
                <Password
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="w-full"
                  inputClassName="w-full"
                  toggleMask
                  feedback={false}
                  required
                />
              </div>

              <Divider />

              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-900 font-medium mb-2">
                  New Password
                </label>
                <Password
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="w-full"
                  inputClassName="w-full"
                  toggleMask
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-900 font-medium mb-2">
                  Confirm New Password
                </label>
                <Password
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="w-full"
                  inputClassName="w-full"
                  toggleMask
                  feedback={false}
                  required
                />
              </div>

              <Button
                type="submit"
                label="Change Password"
                icon="pi pi-lock"
                loading={passwordLoading}
              />
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
