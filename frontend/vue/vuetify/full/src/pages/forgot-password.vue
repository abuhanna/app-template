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
                  Forgot Password?
                </h1>
                <p class="text-subtitle-1" style="color: #424242;">
                  Enter your email to receive a reset link
                </p>
              </div>

              <!-- Success Message -->
              <v-alert
                v-if="submitted"
                class="mb-6"
                color="success"
                variant="tonal"
              >
                <template #prepend>
                  <v-icon>mdi-check-circle</v-icon>
                </template>
                <div class="text-body-2">
                  If an account with that email exists, a password reset link has been sent.
                  Please check your inbox.
                </div>
              </v-alert>

              <!-- Forgot Password Form -->
              <v-form v-if="!submitted" ref="formRef" @submit.prevent="handleSubmit">
                <v-text-field
                  v-model="email"
                  class="mb-4 login-input"
                  clearable
                  color="primary"
                  density="comfortable"
                  label="Email Address"
                  prepend-inner-icon="mdi-email-outline"
                  :rules="[rules.required, rules.email]"
                  type="email"
                  variant="outlined"
                />

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
                  <v-icon class="mr-2" left>mdi-email-fast</v-icon>
                  Send Reset Link
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
  import { ref } from 'vue'
  import { forgotPassword } from '@/services/authApi'
  import { useNotificationStore } from '@/stores/notification'

  definePage({
    meta: {
      layout: 'blank',
      requiresAuth: false,
    },
  })

  const email = ref('')
  const loading = ref(false)
  const submitted = ref(false)
  const formRef = ref(null)
  const notificationStore = useNotificationStore()

  const rules = {
    required: value => !!value || 'Email is required',
    email: value => {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return pattern.test(value) || 'Invalid email format'
    },
  }

  async function handleSubmit () {
    const { valid } = await formRef.value.validate()
    if (!valid) return

    loading.value = true

    try {
      await forgotPassword(email.value)
      submitted.value = true
    } catch (error) {
      console.error('Failed to request password reset:', error)
      notificationStore.error(
        error.response?.data?.message || 'Failed to send reset link. Please try again.'
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

.login-input :deep(.v-field__prepend-inner .v-icon) {
  color: #616161 !important;
  opacity: 1 !important;
}

.login-input :deep(.v-field--focused .v-field__prepend-inner .v-icon) {
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
