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
              <!-- Logo and Welcome Text -->
              <div class="text-center mb-8">
                <v-avatar class="mb-4 logo-avatar" size="80">
                  <v-icon color="white" size="50">mdi-shield-account</v-icon>
                </v-avatar>
                <h1 class="text-h4 font-weight-bold mb-2 text-gradient">
                  Welcome Back
                </h1>
                <p class="text-subtitle-1" style="color: #424242;">
                  Sign in to continue to App Template
                </p>
              </div>

              <!-- Login Form -->
              <v-form ref="formRef" @submit.prevent="login">
                <v-text-field
                  v-model="username"
                  class="mb-2 login-input"
                  clearable
                  color="primary"
                  density="comfortable"
                  label="Username or Email"
                  prepend-inner-icon="mdi-account-outline"
                  :rules="[rules.required]"
                  variant="outlined"
                />

                <v-text-field
                  v-model="password"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  class="mb-2 login-input"
                  color="primary"
                  density="comfortable"
                  label="Password"
                  prepend-inner-icon="mdi-lock-outline"
                  :rules="[rules.required, rules.min]"
                  :type="showPassword ? 'text' : 'password'"
                  variant="outlined"
                  @click:append-inner="showPassword = !showPassword"
                />

                <!-- Forgot Password Link -->
                <div class="d-flex justify-end mb-4">
                  <router-link
                    class="text-decoration-none text-body-2 font-weight-medium forgot-link"
                    to="/forgot-password"
                  >
                    Forgot Password?
                  </router-link>
                </div>

                <!-- Login Button -->
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
                  <v-icon class="mr-2" left>mdi-login</v-icon>
                  Sign In
                </v-btn>

              </v-form>
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
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'

  definePage({
    meta: {
      layout: 'blank',
      requiresAuth: false,
    },
  })

  const username = ref('')
  const password = ref('')
  const showPassword = ref(false)
  const rememberMe = ref(false)
  const loading = ref(false)
  const formRef = ref(null)
  const router = useRouter()

  const rules = {
    required: value => !!value || 'Field is required',
    min: value => value.length >= 6 || 'Minimum 6 characters',
  }

  const authStore = useAuthStore()

  async function login () {
    const { valid } = await formRef.value.validate()

    if (!valid) return

    loading.value = true

    try {
      await authStore.login({
        username: username.value,
        password: password.value,
      })

      // Redirect to intended page or dashboard
      const redirectTo = router.currentRoute.value.query.redirect || '/dashboard'
      router.push(redirectTo)
    } catch (error) {
      console.error('Login failed:', error)
      // Error akan ditampilkan oleh store
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

.login-input :deep(input::placeholder) {
  color: #9e9e9e !important;
  opacity: 1 !important;
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

/* Browser Autofill Styling - Override default yellow background */
.login-input :deep(input:-webkit-autofill),
.login-input :deep(input:-webkit-autofill:hover),
.login-input :deep(input:-webkit-autofill:focus),
.login-input :deep(input:-webkit-autofill:active) {
  -webkit-background-clip: text;
  -webkit-text-fill-color: #212121 !important;
  transition: background-color 5000s ease-in-out 0s;
  box-shadow: inset 0 0 0 1px transparent, inset 0 0 0 100px #e3f2fd !important;
  caret-color: #212121 !important;
  font-weight: 500 !important;
}

.login-input :deep(input:-moz-autofill),
.login-input :deep(input:-moz-autofill:hover),
.login-input :deep(input:-moz-autofill:focus) {
  background-color: #e3f2fd !important;
  color: #212121 !important;
  font-weight: 500 !important;
}

.login-input :deep(input:autofill),
.login-input :deep(input:autofill:hover),
.login-input :deep(input:autofill:focus) {
  background-color: #e3f2fd !important;
  color: #212121 !important;
  font-weight: 500 !important;
}

/* Checkbox Styling */
.remember-checkbox :deep(.v-label) {
  color: #424242 !important;
  font-size: 0.875rem;
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

.signup-link {
  color: #667eea;
  transition: color 0.2s ease;
}

.signup-link:hover {
  color: #5568d3;
  text-decoration: underline !important;
}

/* Text Colors */
.secondary-text {
  color: #616161;
}

/* Social Buttons */
.social-btn {
  transition: all 0.2s ease;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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

/* Gap utility for social buttons */
.gap-3 {
  gap: 12px;
}
</style>
