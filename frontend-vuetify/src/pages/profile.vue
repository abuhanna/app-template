<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <!-- Profile Header -->
        <v-card class="mb-6">
          <v-card-text class="text-center py-8">
            <v-avatar size="100" color="primary" class="mb-4">
              <span class="text-h3 text-white">{{ userInitials }}</span>
            </v-avatar>
            <h2 class="text-h5 font-weight-bold">{{ profile?.name || profile?.username }}</h2>
            <p class="text-body-2 text-medium-emphasis">{{ profile?.email }}</p>
            <v-chip
              :color="profile?.role === 'Admin' ? 'primary' : 'secondary'"
              size="small"
              class="mt-2"
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
                label="Display Name"
                variant="outlined"
                class="mb-4"
                :rules="[v => !v || v.length <= 100 || 'Name cannot exceed 100 characters']"
              />

              <v-text-field
                v-model="editForm.email"
                label="Email"
                type="email"
                variant="outlined"
                class="mb-4"
                :rules="[
                  v => !!v || 'Email is required',
                  v => /.+@.+\..+/.test(v) || 'Invalid email format'
                ]"
              />

              <div class="d-flex gap-2">
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="saving"
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
                label="Current Password"
                type="password"
                variant="outlined"
                class="mb-4"
                :rules="[v => !!v || 'Current password is required']"
              />

              <v-text-field
                v-model="passwordForm.newPassword"
                label="New Password"
                type="password"
                variant="outlined"
                :rules="[
                  v => !!v || 'New password is required',
                  v => v.length >= 8 || 'Password must be at least 8 characters',
                  v => /[A-Z]/.test(v) || 'Must contain uppercase letter',
                  v => /[a-z]/.test(v) || 'Must contain lowercase letter',
                  v => /[0-9]/.test(v) || 'Must contain a number'
                ]"
              />
              <PasswordStrength :password="passwordForm.newPassword" class="mb-4" />

              <v-text-field
                v-model="passwordForm.confirmPassword"
                label="Confirm New Password"
                type="password"
                variant="outlined"
                class="mb-4"
                :rules="[
                  v => !!v || 'Please confirm your password',
                  v => v === passwordForm.newPassword || 'Passwords do not match'
                ]"
              />

              <v-btn
                color="primary"
                type="submit"
                :loading="changingPassword"
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
  import { ref, computed, onMounted } from 'vue'
  import { getProfile, updateProfile } from '@/services/authApi'
  import { changePassword as apiChangePassword } from '@/services/userApi'
  import { useNotificationStore } from '@/stores/notification'
  import PasswordStrength from '@/components/common/PasswordStrength.vue'

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

  const formatDate = date => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const fetchProfile = async () => {
    try {
      loading.value = true
      profile.value = await getProfile()
    } catch (error) {
      notificationStore.showError('Failed to load profile')
      console.error('Error loading profile:', error)
    } finally {
      loading.value = false
    }
  }

  const startEditing = () => {
    editForm.value = {
      name: profile.value?.name || '',
      email: profile.value?.email || '',
    }
    isEditing.value = true
  }

  const cancelEditing = () => {
    isEditing.value = false
  }

  const saveProfile = async () => {
    try {
      saving.value = true
      profile.value = await updateProfile(editForm.value)
      isEditing.value = false
      notificationStore.showSuccess('Profile updated successfully')
    } catch (error) {
      notificationStore.showError(error.response?.data?.message || 'Failed to update profile')
    } finally {
      saving.value = false
    }
  }

  const changePassword = async () => {
    try {
      changingPassword.value = true
      await apiChangePassword(profile.value.id, {
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword,
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
