<template>
  <div class="login-background">
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col
          cols="12"
          lg="4"
          md="5"
          sm="8"
          xl="3"
        >
          <v-card
            class="login-card pa-4"
            elevation="24"
            rounded="xl"
          >
            <v-card-text class="pa-8">
              <!-- Logo and Title -->
              <div class="text-center mb-8">
                <v-avatar class="mb-4 logo-avatar" size="80">
                  <v-icon color="white" size="50">mdi-lock-reset</v-icon>
                </v-avatar>
                <h1 class="text-h4 font-weight-bold mb-2 text-gradient">
                  Reset Password
                </h1>
                <p class="text-subtitle-1" style="color: #424242;">
                  Enter your new password below
                </p>
              </div>

              <!-- Invalid Token Message -->
              <v-alert
                v-if="!token"
                class="mb-6"
                color="error"
                variant="tonal"
              >
                <template #prepend>
                  <v-icon>mdi-alert-circle</v-icon>
                </template>
                <div class="text-body-2">
                  Invalid or missing reset token. Please request a new password reset link.
                </div>
              </v-alert>

              <!-- Success Message -->
              <v-alert
                v-else-if="success"
                class="mb-6"
                color="success"
                variant="tonal"
              >
                <template #prepend>
                  <v-icon>mdi-check-circle</v-icon>
                </template>
                <div class="text-body-2">
                  Password reset successfully! You can now sign in with your new password.
                </div>
              </v-alert>

              <!-- Reset Password Form -->
              <v-form v-else ref="formRef" @submit.prevent="handleSubmit">
                <v-text-field
                  v-model="newPassword"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  class="mb-2 login-input"
                  color="primary"
                  density="comfortable"
                  label="New Password"
                  prepend-inner-icon="mdi-lock-outline"
                  :rules="passwordRules"
                  :type="showPassword ? 'text' : 'password'"
                  variant="outlined"
                  @click:append-inner="showPassword = !showPassword"
                />

                <v-text-field
                  v-model="confirmPassword"
                  :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  class="mb-4 login-input"
                  color="primary"
                  density="comfortable"
                  label="Confirm Password"
                  prepend-inner-icon="mdi-lock-check-outline"
                  :rules="confirmPasswordRules"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  variant="outlined"
                  @click:append-inner="showConfirmPassword = !showConfirmPassword"
                />

                <!-- Password Requirements -->
                <v-alert
                  class="mb-4"
                  color="info"
                  density="compact"
                  variant="tonal"
                >
                  <div class="text-caption">
                    Password must contain:
                    <ul class="ml-4">
                      <li>At least 8 characters</li>
                      <li>One uppercase letter</li>
                      <li>One lowercase letter</li>
                      <li>One digit</li>
                    </ul>
                  </div>
                </v-alert>

                <!-- Submit Button -->
                <v-btn
                  block
                  class="mb-4 text-none"
                  color="primary"
                  :loading="loading"
                  rounded="lg"
                  size="large"
                  type="submit"
                  variant="elevated"
                >
                  <v-icon class="mr-2" left>mdi-check</v-icon>
                  Reset Password
                </v-btn>
              </v-form>

              <!-- Back to Login -->
              <div class="text-center">
                <router-link
                  class="text-decoration-none text-body-2 font-weight-medium forgot-link"
                  to="/login"
                >
                  <v-icon class="mr-1" size="small">mdi-arrow-left</v-icon>
                  Back to Sign In
                </router-link>
              </div>
            </v-card-text>
          </v-card>

          <!-- Footer Text -->
          <div class="text-center mt-6">
            <p class="text-body-2" style="color: rgba(255, 255, 255, 0.9); text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);">
              © 2025 App Template. All rights reserved.
            </p>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Animated Background Elements -->
    <div class="background-shapes">
      <div class="shape shape-1" />
      <div class="shape shape-2" />
      <div class="shape shape-3" />
    </div>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { resetPassword } from '@/services/authApi'
  import { useNotificationStore } from '@/stores/notification'

  definePage({
    meta: {
      layout: 'blank',
      requiresAuth: false,
    },
  })

  const route = useRoute()
  const router = useRouter()
  const notificationStore = useNotificationStore()

  const token = computed(() => route.query.token)
  const newPassword = ref('')
  const confirmPassword = ref('')
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)
  const loading = ref(false)
  const success = ref(false)
  const formRef = ref(null)

  const passwordRules = [
    value => !!value || 'Password is required',
    value => value.length >= 8 || 'Password must be at least 8 characters',
    value => /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
    value => /[a-z]/.test(value) || 'Password must contain at least one lowercase letter',
    value => /[0-9]/.test(value) || 'Password must contain at least one digit',
  ]

  const confirmPasswordRules = [
    value => !!value || 'Please confirm your password',
    value => value === newPassword.value || 'Passwords do not match',
  ]

  async function handleSubmit () {
    const { valid } = await formRef.value.validate()
    if (!valid) return

    loading.value = true

    try {
      await resetPassword(token.value, newPassword.value, confirmPassword.value)
      success.value = true
      notificationStore.success('Password reset successfully!')

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error) {
      console.error('Failed to reset password:', error)
      notificationStore.error(
        error.response?.data?.message || 'Failed to reset password. The link may have expired.'
      )
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
.login-background {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a237e 0%, #311b92 50%, #4a148c 100%);
  position: relative;
  overflow: hidden;
}

.login-card {
  backdrop-filter: blur(10px);
  background: #ffffff !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25) !important;
}

.logo-avatar {
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  transition: transform 0.3s ease;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.logo-avatar:hover {
  transform: scale(1.05);
}

.text-gradient {
  color: #1a237e;
  font-weight: 700;
}

/* Input Field Styling */
.login-input :deep(.v-field__input) {
  color: #212121 !important;
  font-weight: 500;
}

.login-input :deep(.v-field) {
  background-color: #fafafa !important;
  border-radius: 8px;
}

.login-input :deep(.v-field--focused) {
  background-color: #ffffff !important;
}

.login-input :deep(.v-field__outline) {
  color: rgba(0, 0, 0, 0.2);
}

.login-input :deep(.v-field--focused .v-field__outline) {
  color: #667eea;
}

.login-input :deep(.v-label) {
  color: #616161 !important;
  opacity: 1 !important;
}

.login-input :deep(.v-field--focused .v-label) {
  color: #667eea !important;
}

.login-input :deep(.v-field__prepend-inner .v-icon),
.login-input :deep(.v-field__append-inner .v-icon) {
  color: #616161 !important;
  opacity: 1 !important;
}

.login-input :deep(.v-field--focused .v-field__prepend-inner .v-icon),
.login-input :deep(.v-field--focused .v-field__append-inner .v-icon) {
  color: #667eea !important;
}

/* Link Styling */
.forgot-link {
  color: #667eea;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: #5568d3;
  text-decoration: underline !important;
}

/* Animated Background Shapes */
.background-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  opacity: 0.15;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  animation: float 20s infinite ease-in-out;
  filter: blur(40px);
}

.shape-1 {
  width: 400px;
  height: 400px;
  top: -150px;
  left: -150px;
  animation-delay: 0s;
}

.shape-2 {
  width: 300px;
  height: 300px;
  bottom: -100px;
  right: -100px;
  animation-delay: -7s;
}

.shape-3 {
  width: 250px;
  height: 250px;
  top: 50%;
  right: 10%;
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(50px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-50px, 50px) scale(0.9);
  }
}

/* Ensure container is above background shapes */
.v-container {
  position: relative;
  z-index: 1;
}
</style>
