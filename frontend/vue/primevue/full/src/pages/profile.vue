<template>
  <div class="flex flex-column gap-4 p-3">
    <div class="grid">
      <!-- Profile Information -->
      <div class="col-12 md:col-6">
        <Card class="h-full">
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-user text-primary" />
              <span>Profile Information</span>
            </div>
          </template>
          <template #content>
            <form class="flex flex-column gap-3" @submit.prevent="handleUpdateProfile">
              <div class="flex flex-column gap-2">
                <label class="font-medium" for="username">Username</label>
                <InputText id="username" class="w-full" disabled :value="user?.username" />
                <small class="text-color-secondary">Username cannot be changed</small>
              </div>

              <div class="flex flex-column gap-2">
                <label class="font-medium" for="email">Email *</label>
                <InputText
                  id="email"
                  v-model="profileForm.email"
                  class="w-full"
                  :invalid="!!profileErrors.email"
                  type="email"
                />
                <small v-if="profileErrors.email" class="text-red-500">{{ profileErrors.email }}</small>
              </div>

              <div class="flex flex-column gap-2">
                <label class="font-medium" for="name">Name</label>
                <InputText id="name" v-model="profileForm.name" class="w-full" />
              </div>

              <div class="flex flex-column gap-2">
                <label class="font-medium">Role</label>
                <div class="flex">
                  <Tag :severity="user?.role === 'admin' ? 'danger' : 'info'" :value="user?.role" />
                </div>
              </div>

              <div class="flex flex-column gap-2">
                <label class="font-medium">Department</label>
                <span>{{ user?.departmentName || 'Not assigned' }}</span>
              </div>

              <div class="mt-2">
                <Button
                  icon="pi pi-check"
                  label="Update Profile"
                  :loading="savingProfile"
                  type="submit"
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
              <i class="pi pi-lock text-primary" />
              <span>Change Password</span>
            </div>
          </template>
          <template #content>
            <form class="flex flex-column gap-3" @submit.prevent="handleChangePassword">
              <div class="flex flex-column gap-2">
                <label class="font-medium" for="currentPassword">Current Password *</label>
                <Password
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  class="w-full"
                  :feedback="false"
                  input-class="w-full"
                  :invalid="!!passwordErrors.currentPassword"
                  toggle-mask
                />
                <small v-if="passwordErrors.currentPassword" class="text-red-500">
                  {{ passwordErrors.currentPassword }}
                </small>
              </div>

              <div class="flex flex-column gap-2">
                <label class="font-medium" for="newPassword">New Password *</label>
                <Password
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  class="w-full"
                  :feedback="false"
                  input-class="w-full"
                  :invalid="!!passwordErrors.newPassword"
                  toggle-mask
                />
                <PasswordStrength :password="passwordForm.newPassword" />
                <small v-if="passwordErrors.newPassword" class="text-red-500">
                  {{ passwordErrors.newPassword }}
                </small>
              </div>

              <div class="flex flex-column gap-2">
                <label class="font-medium" for="confirmPassword">Confirm New Password *</label>
                <Password
                  id="confirmPassword"
                  v-model="passwordForm.confirmPassword"
                  class="w-full"
                  :feedback="false"
                  input-class="w-full"
                  :invalid="!!passwordErrors.confirmPassword"
                  toggle-mask
                />
                <small v-if="passwordErrors.confirmPassword" class="text-red-500">
                  {{ passwordErrors.confirmPassword }}
                </small>
              </div>

              <div class="mt-2">
                <Button
                  icon="pi pi-lock"
                  label="Change Password"
                  :loading="savingPassword"
                  severity="warning"
                  type="submit"
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
  import Button from 'primevue/button'
  import Card from 'primevue/card'
  import InputText from 'primevue/inputtext'
  import Password from 'primevue/password'
  import Tag from 'primevue/tag'
  import { computed, onMounted, reactive, ref } from 'vue'
  import PasswordStrength from '@/components/common/PasswordStrength.vue'
  import authApi from '@/services/authApi'
  import { useAuthStore } from '@/stores/auth'
  import { useNotificationStore } from '@/stores/notification'

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

  function validateProfile () {
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

  function validatePassword () {
    let valid = true
    for (const key of Object.keys(passwordErrors)) (passwordErrors[key] = '')

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

  async function handleUpdateProfile () {
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

  async function handleChangePassword () {
    if (!validatePassword()) return

    savingPassword.value = true
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
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
