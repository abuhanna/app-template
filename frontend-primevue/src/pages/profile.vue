<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>My Profile</h1>
      <p class="page-subtitle">Manage your account settings</p>
    </div>

    <div class="profile-grid">
      <!-- Profile Information -->
      <Card class="profile-card">
        <template #title>
          <div class="card-title-with-icon">
            <i class="pi pi-user"></i>
            <span>Profile Information</span>
          </div>
        </template>
        <template #content>
          <form @submit.prevent="handleUpdateProfile" class="profile-form">
            <div class="form-field">
              <label for="username">Username</label>
              <InputText id="username" :value="user?.username" disabled class="w-full" />
              <small class="help-text">Username cannot be changed</small>
            </div>

            <div class="form-field">
              <label for="email">Email *</label>
              <InputText
                id="email"
                v-model="profileForm.email"
                type="email"
                :invalid="!!profileErrors.email"
                class="w-full"
              />
              <small v-if="profileErrors.email" class="p-error">{{ profileErrors.email }}</small>
            </div>

            <div class="form-field">
              <label for="name">Name</label>
              <InputText id="name" v-model="profileForm.name" class="w-full" />
            </div>

            <div class="form-field">
              <label>Role</label>
              <Tag :value="user?.role" :severity="user?.role === 'Admin' ? 'danger' : 'info'" />
            </div>

            <div class="form-field">
              <label>Department</label>
              <span>{{ user?.departmentName || 'Not assigned' }}</span>
            </div>

            <div class="form-actions">
              <Button
                type="submit"
                label="Update Profile"
                :loading="savingProfile"
                icon="pi pi-check"
              />
            </div>
          </form>
        </template>
      </Card>

      <!-- Change Password -->
      <Card class="password-card">
        <template #title>
          <div class="card-title-with-icon">
            <i class="pi pi-lock"></i>
            <span>Change Password</span>
          </div>
        </template>
        <template #content>
          <form @submit.prevent="handleChangePassword" class="password-form">
            <div class="form-field">
              <label for="currentPassword">Current Password *</label>
              <Password
                id="currentPassword"
                v-model="passwordForm.currentPassword"
                :feedback="false"
                toggleMask
                :invalid="!!passwordErrors.currentPassword"
                inputClass="w-full"
                class="w-full"
              />
              <small v-if="passwordErrors.currentPassword" class="p-error">
                {{ passwordErrors.currentPassword }}
              </small>
            </div>

            <div class="form-field">
              <label for="newPassword">New Password *</label>
              <Password
                id="newPassword"
                v-model="passwordForm.newPassword"
                toggleMask
                :invalid="!!passwordErrors.newPassword"
                inputClass="w-full"
                class="w-full"
              />
              <small v-if="passwordErrors.newPassword" class="p-error">
                {{ passwordErrors.newPassword }}
              </small>
            </div>

            <div class="form-field">
              <label for="confirmPassword">Confirm New Password *</label>
              <Password
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                :feedback="false"
                toggleMask
                :invalid="!!passwordErrors.confirmPassword"
                inputClass="w-full"
                class="w-full"
              />
              <small v-if="passwordErrors.confirmPassword" class="p-error">
                {{ passwordErrors.confirmPassword }}
              </small>
            </div>

            <div class="form-actions">
              <Button
                type="submit"
                label="Change Password"
                :loading="savingPassword"
                icon="pi pi-lock"
                severity="warning"
              />
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import authApi from '@/services/authApi'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Tag from 'primevue/tag'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const user = computed(() => authStore.user)

const savingProfile = ref(false)
const savingPassword = ref(false)

const profileForm = reactive({
  email: '',
  name: '',
})

const profileErrors = reactive({
  email: '',
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

onMounted(() => {
  if (user.value) {
    profileForm.email = user.value.email || ''
    profileForm.name = user.value.name || ''
  }
})

const validateProfile = () => {
  let valid = true
  profileErrors.email = ''

  if (!profileForm.email.trim()) {
    profileErrors.email = 'Email is required'
    valid = false
  } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
    profileErrors.email = 'Invalid email format'
    valid = false
  }

  return valid
}

const validatePassword = () => {
  let valid = true
  Object.keys(passwordErrors).forEach((key) => (passwordErrors[key] = ''))

  if (!passwordForm.currentPassword) {
    passwordErrors.currentPassword = 'Current password is required'
    valid = false
  }

  if (!passwordForm.newPassword) {
    passwordErrors.newPassword = 'New password is required'
    valid = false
  } else if (passwordForm.newPassword.length < 6) {
    passwordErrors.newPassword = 'Password must be at least 6 characters'
    valid = false
  }

  if (!passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = 'Please confirm your new password'
    valid = false
  } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = 'Passwords do not match'
    valid = false
  }

  return valid
}

const handleUpdateProfile = async () => {
  if (!validateProfile()) return

  savingProfile.value = true
  try {
    await authApi.updateProfile({
      email: profileForm.email,
      name: profileForm.name,
    })
    await authStore.fetchProfile()
    notificationStore.success('Profile updated successfully')
  } catch (error) {
    notificationStore.error(error.response?.data?.message || 'Failed to update profile')
  } finally {
    savingProfile.value = false
  }
}

const handleChangePassword = async () => {
  if (!validatePassword()) return

  savingPassword.value = true
  try {
    await authApi.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
    notificationStore.success('Password changed successfully')
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    notificationStore.error(error.response?.data?.message || 'Failed to change password')
  } finally {
    savingPassword.value = false
  }
}
</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 480px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

.card-title-with-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-title-with-icon i {
  color: var(--p-primary-color);
}

.profile-form,
.password-form {
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

.help-text {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
}

.form-actions {
  margin-top: 0.5rem;
}

.w-full {
  width: 100%;
}
</style>
