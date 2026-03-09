<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" lg="6" md="8">
        <!-- Profile Header -->
        <v-card class="mb-6">
          <v-card-text class="text-center py-8">
            <v-avatar class="mb-4" color="primary" size="100">
              <span class="text-h3 text-white">{{ userInitials }}</span>
            </v-avatar>
            <h2 class="text-h5 font-weight-bold">{{ profile?.name || profile?.username }}</h2>
            <p class="text-body-2 text-medium-emphasis">{{ profile?.email }}</p>
            <v-chip
              class="mt-2"
              :color="profile?.role === 'admin' ? 'primary' : 'secondary'"
              size="small"
            >
              {{ profile?.role || 'User' }}
            </v-chip>
          </v-card-text>
        </v-card>

        <!-- Profile Details -->
        <v-card class="mb-6">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Profile Information</span>
            <v-btn
              v-if="!isEditing"
              color="primary"
              variant="text"
              @click="startEditing"
            >
              <v-icon start>mdi-pencil</v-icon>
              Edit
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-card-text>
            <v-form v-if="isEditing" ref="form" @submit.prevent="saveProfile">
              <v-text-field
                v-model="editForm.name"
                class="mb-4"
                label="Display Name"
                :rules="[v => !v || v.length <= 100 || 'Name cannot exceed 100 characters']"
                variant="outlined"
              />

              <v-text-field
                v-model="editForm.email"
                class="mb-4"
                label="Email"
                :rules="[
                  v => !!v || 'Email is required',
                  v => /.+@.+\..+/.test(v) || 'Invalid email format'
                ]"
                type="email"
                variant="outlined"
              />

              <div class="d-flex gap-2">
                <v-btn
                  color="primary"
                  :loading="saving"
                  type="submit"
                >
                  Save Changes
                </v-btn>
                <v-btn
                  variant="text"
                  @click="cancelEditing"
                >
                  Cancel
                </v-btn>
              </div>
            </v-form>

            <v-list v-else lines="two">
              <v-list-item>
                <template #prepend>
                  <v-icon color="primary">mdi-account</v-icon>
                </template>
                <v-list-item-title>Username</v-list-item-title>
                <v-list-item-subtitle>{{ profile?.username }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="primary">mdi-badge-account</v-icon>
                </template>
                <v-list-item-title>Display Name</v-list-item-title>
                <v-list-item-subtitle>{{ profile?.name || 'Not set' }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="primary">mdi-email</v-icon>
                </template>
                <v-list-item-title>Email</v-list-item-title>
                <v-list-item-subtitle>{{ profile?.email }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="primary">mdi-domain</v-icon>
                </template>
                <v-list-item-title>Department</v-list-item-title>
                <v-list-item-subtitle>{{ profile?.departmentName || 'Not assigned' }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="primary">mdi-calendar</v-icon>
                </template>
                <v-list-item-title>Member Since</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(profile?.createdAt) }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="primary">mdi-clock</v-icon>
                </template>
                <v-list-item-title>Last Login</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(profile?.lastLoginAt) }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Change Password Section -->
        <v-card>
          <v-card-title>
            <v-icon start>mdi-lock</v-icon>
            Change Password
          </v-card-title>

          <v-divider />

          <v-card-text>
            <v-form ref="passwordForm" @submit.prevent="changePassword">
              <v-text-field
                v-model="passwordForm.currentPassword"
                class="mb-4"
                label="Current Password"
                :rules="[v => !!v || 'Current password is required']"
                type="password"
                variant="outlined"
              />

              <v-text-field
                v-model="passwordForm.newPassword"
                label="New Password"
                :rules="[
                  v => !!v || 'New password is required',
                  v => v.length >= 8 || 'Password must be at least 8 characters',
                  v => /[A-Z]/.test(v) || 'Must contain uppercase letter',
                  v => /[a-z]/.test(v) || 'Must contain lowercase letter',
                  v => /[0-9]/.test(v) || 'Must contain a number'
                ]"
                type="password"
                variant="outlined"
              />
              <PasswordStrength class="mb-4" :password="passwordForm.newPassword" />

              <v-text-field
                v-model="passwordForm.confirmPassword"
                class="mb-4"
                label="Confirm New Password"
                :rules="[
                  v => !!v || 'Please confirm your password',
                  v => v === passwordForm.newPassword || 'Passwords do not match'
                ]"
                type="password"
                variant="outlined"
              />

              <v-btn
                color="primary"
                :loading="changingPassword"
                type="submit"
              >
                Update Password
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import PasswordStrength from '@/components/common/PasswordStrength.vue'
  import { changePassword as apiChangePassword, getProfile, updateProfile } from '@/services/authApi'
  import { useNotificationStore } from '@/stores/notification'

  const notificationStore = useNotificationStore()

  const profile = ref(null)
  const loading = ref(true)
  const isEditing = ref(false)
  const saving = ref(false)
  const changingPassword = ref(false)

  const editForm = ref({
    name: '',
    email: '',
  })

  const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const userInitials = computed(() => {
    const name = profile.value?.name || profile.value?.username || ''
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  })

  function formatDate (date) {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  async function fetchProfile () {
    try {
      loading.value = true
      const result = await getProfile()
      profile.value = result.data
    } catch (error) {
      notificationStore.showError('Failed to load profile')
      console.error('Error loading profile:', error)
    } finally {
      loading.value = false
    }
  }

  function startEditing () {
    editForm.value = {
      name: profile.value?.name || '',
      email: profile.value?.email || '',
    }
    isEditing.value = true
  }

  function cancelEditing () {
    isEditing.value = false
  }

  async function saveProfile () {
    try {
      saving.value = true
      const result = await updateProfile(editForm.value)
      profile.value = result.data
      isEditing.value = false
      notificationStore.showSuccess('Profile updated successfully')
    } catch (error) {
      notificationStore.showError(error.response?.data?.message || 'Failed to update profile')
    } finally {
      saving.value = false
    }
  }

  async function changePassword () {
    try {
      changingPassword.value = true
      await apiChangePassword({
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword,
        confirmPassword: passwordForm.value.confirmPassword,
      })
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }
      notificationStore.showSuccess('Password changed successfully')
    } catch (error) {
      notificationStore.showError(error.response?.data?.message || 'Failed to change password')
    } finally {
      changingPassword.value = false
    }
  }

  onMounted(fetchProfile)
</script>
