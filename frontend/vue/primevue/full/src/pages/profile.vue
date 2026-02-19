<template>
  <div class="flex flex-column gap-4 p-3">
    <div class="grid">
      <!-- Profile Information -->
      <div class="col-12 md:col-6">
        <Card class="h-full">
            <template #title>
            <div class="flex align-items-center gap-2">
                <i class="pi pi-user text-primary"></i>
                <span>Profile Information</span>
            </div>
            </template>
            <template #content>
            <form @submit.prevent="handleUpdateProfile" class="flex flex-column gap-3">
                <div class="flex flex-column gap-2">
                <label for="username" class="font-medium">Username</label>
                <InputText id="username" :value="user?.username" disabled class="w-full" />
                <small class="text-color-secondary">Username cannot be changed</small>
                </div>

                <div class="flex flex-column gap-2">
                <label for="email" class="font-medium">Email *</label>
                <InputText
                    id="email"
                    v-model="profileForm.email"
                    type="email"
                    :invalid="!!profileErrors.email"
                    class="w-full"
                />
                <small v-if="profileErrors.email" class="text-red-500">{{ profileErrors.email }}</small>
                </div>

                <div class="flex flex-column gap-2">
                <label for="name" class="font-medium">Name</label>
                <InputText id="name" v-model="profileForm.name" class="w-full" />
                </div>

                <div class="flex flex-column gap-2">
                <label class="font-medium">Role</label>
                <div class="flex">
                    <Tag :value="user?.role" :severity="user?.role === 'Admin' ? 'danger' : 'info'" />
                </div>
                </div>

                <div class="flex flex-column gap-2">
                <label class="font-medium">Department</label>
                <span>{{ user?.departmentName || 'Not assigned' }}</span>
                </div>

                <div class="mt-2">
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
      </div>

      <!-- Change Password -->
      <div class="col-12 md:col-6">
        <Card class="h-full">
            <template #title>
            <div class="flex align-items-center gap-2">
                <i class="pi pi-lock text-primary"></i>
                <span>Change Password</span>
            </div>
            </template>
            <template #content>
            <form @submit.prevent="handleChangePassword" class="flex flex-column gap-3">
                <div class="flex flex-column gap-2">
                <label for="currentPassword" class="font-medium">Current Password *</label>
                <Password
                    id="currentPassword"
                    v-model="passwordForm.currentPassword"
                    :feedback="false"
                    toggleMask
                    :invalid="!!passwordErrors.currentPassword"
                    inputClass="w-full"
                    class="w-full"
                />
                <small v-if="passwordErrors.currentPassword" class="text-red-500">
                    {{ passwordErrors.currentPassword }}
                </small>
                </div>

                <div class="flex flex-column gap-2">
                <label for="newPassword" class="font-medium">New Password *</label>
                <Password
                    id="newPassword"
                    v-model="passwordForm.newPassword"
                    toggleMask
                    :feedback="false"
                    :invalid="!!passwordErrors.newPassword"
                    inputClass="w-full"
                    class="w-full"
                />
                <PasswordStrength :password="passwordForm.newPassword" />
                <small v-if="passwordErrors.newPassword" class="text-red-500">
                    {{ passwordErrors.newPassword }}
                </small>
                </div>

                <div class="flex flex-column gap-2">
                <label for="confirmPassword" class="font-medium">Confirm New Password *</label>
                <Password
                    id="confirmPassword"
                    v-model="passwordForm.confirmPassword"
                    :feedback="false"
                    toggleMask
                    :invalid="!!passwordErrors.confirmPassword"
                    inputClass="w-full"
                    class="w-full"
                />
                <small v-if="passwordErrors.confirmPassword" class="text-red-500">
                    {{ passwordErrors.confirmPassword }}
                </small>
                </div>

                <div class="mt-2">
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
import PasswordStrength from '@/components/common/PasswordStrength.vue'

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
.text-red-500 {
  color: var(--p-red-500);
}
</style>
