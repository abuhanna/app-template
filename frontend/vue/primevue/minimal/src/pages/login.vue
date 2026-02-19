<template>
  <div class="login-page">
    <!-- Animated Background -->
    <div class="login-background">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <!-- Login Card -->
    <div class="login-card">
      <div class="card-content">
        <!-- Logo & Header -->
        <div class="login-header">
          <div class="logo-wrapper">
            <i class="pi pi-box"></i>
          </div>
          <h1>AppTemplate</h1>
          <p>Welcome back! Please sign in to continue.</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <Message v-if="error" severity="error" :closable="false" class="mb-4">
            {{ error }}
          </Message>

          <div class="field">
            <label for="username">
              <i class="pi pi-user"></i>
              Username
            </label>
            <InputText
              id="username"
              v-model="form.username"
              placeholder="Enter your username"
              :disabled="loading"
              :invalid="!!errors.username"
              size="large"
            />
            <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
          </div>

          <div class="field">
            <label for="password">
              <i class="pi pi-lock"></i>
              Password
            </label>
            <Password
              id="password"
              v-model="form.password"
              placeholder="Enter your password"
              :disabled="loading"
              :feedback="false"
              toggleMask
              :invalid="!!errors.password"
              inputClass="w-full"
              size="large"
            />
            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
          </div>

          <div class="form-options">
            <router-link to="/forgot-password" class="forgot-link">
              Forgot password?
            </router-link>
          </div>

          <Button
            type="submit"
            label="Sign In"
            icon="pi pi-sign-in"
            :loading="loading"
            size="large"
            class="submit-button"
          />
        </form>

        <!-- Footer -->
        <div class="login-footer">
          <p>Secure login powered by JWT authentication</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

definePage({
  meta: {
    layout: 'blank',
  },
})

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const form = reactive({
  username: '',
  password: '',
})
const errors = reactive({
  username: '',
  password: '',
})

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})

const validate = () => {
  errors.username = ''
  errors.password = ''
  let valid = true

  if (!form.username.trim()) {
    errors.username = 'Username is required'
    valid = false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    valid = false
  }

  return valid
}

const handleLogin = async () => {
  if (!validate()) return

  loading.value = true
  error.value = ''

  try {
    await authStore.login({
      username: form.username,
      password: form.password,
    })
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Invalid username or password'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 50%, #1b263b 100%);
}

/* Animated Background Shapes */
.login-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  top: -200px;
  right: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  bottom: -150px;
  left: -100px;
  animation-delay: -7s;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #f472b6, #a855f7);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(20px, 30px) scale(1.02); }
}

/* Login Card */
.login-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.card-content {
  padding: 3rem;
}

/* Header */
.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 20px;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 30px -5px rgba(99, 102, 241, 0.5);
}

.logo-wrapper i {
  font-size: 2rem;
  color: white;
}

.login-header h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.login-header p {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #334155;
}

.field label i {
  font-size: 0.875rem;
  color: #6366f1;
}

.field :deep(.p-inputtext),
.field :deep(.p-password-input) {
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background: #f8fafc;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.field :deep(.p-inputtext:focus),
.field :deep(.p-password-input:focus) {
  border-color: #6366f1;
  background: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.field :deep(.p-password) {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
}

.field :deep(.p-password > .p-inputtext) {
  width: 100%;
  padding-right: 3rem;
}

.field :deep(.p-password-toggle-mask-btn),
.field :deep(.p-password-mask-toggle) {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent !important;
  border: none !important;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}

.field :deep(.p-password-toggle-mask-btn:hover),
.field :deep(.p-password-mask-toggle:hover) {
  color: #6366f1;
}

.form-options {
  display: flex;
  justify-content: flex-end;
  margin-top: -0.5rem;
}

.forgot-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6366f1;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #4f46e5;
  text-decoration: underline;
}

/* Submit Button */
.submit-button {
  width: 100%;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  box-shadow: 0 10px 30px -5px rgba(99, 102, 241, 0.4);
  transition: all 0.2s ease;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px -5px rgba(99, 102, 241, 0.5);
}

.submit-button:active {
  transform: translateY(0);
}

/* Footer */
.login-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.login-footer p {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0;
}

/* Utility Classes */
.w-full {
  width: 100%;
}

.mb-4 {
  margin-bottom: 1rem;
}

/* Responsive */
@media (max-width: 480px) {
  .login-page {
    padding: 1rem;
  }

  .card-content {
    padding: 2rem 1.5rem;
  }

  .logo-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 16px;
  }

  .logo-wrapper i {
    font-size: 1.5rem;
  }

  .login-header h1 {
    font-size: 1.5rem;
  }
}
</style>
