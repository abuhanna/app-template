<template>
  <div class="reset-password-container">
    <div class="reset-password-card">
      <div class="card-header">
        <i class="pi pi-lock logo-icon"></i>
        <h1 class="card-title">Reset Password</h1>
        <p class="card-subtitle">Enter your new password below.</p>
      </div>

      <form v-if="!success" @submit.prevent="handleSubmit" class="reset-password-form">
        <Message v-if="error" severity="error" :closable="false">
          {{ error }}
        </Message>

        <div class="form-field">
          <label for="password">New Password</label>
          <Password
            id="password"
            v-model="form.password"
            placeholder="Enter new password"
            :disabled="loading"
            toggleMask
            :invalid="!!errors.password"
            inputClass="w-full"
            class="w-full"
          />
          <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
        </div>

        <div class="form-field">
          <label for="confirmPassword">Confirm Password</label>
          <Password
            id="confirmPassword"
            v-model="form.confirmPassword"
            placeholder="Confirm new password"
            :disabled="loading"
            :feedback="false"
            toggleMask
            :invalid="!!errors.confirmPassword"
            inputClass="w-full"
            class="w-full"
          />
          <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
        </div>

        <Button
          type="submit"
          label="Reset Password"
          :loading="loading"
          class="w-full"
          size="large"
        />

        <div class="back-to-login">
          <router-link to="/login" class="back-link">
            <i class="pi pi-arrow-left"></i>
            Back to Login
          </router-link>
        </div>
      </form>

      <div v-else class="success-state">
        <div class="success-icon">
          <i class="pi pi-check-circle"></i>
        </div>
        <h2>Password Reset Successful</h2>
        <p>Your password has been successfully reset. You can now login with your new password.</p>
        <Button
          label="Go to Login"
          @click="$router.push('/login')"
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authApi from '@/services/authApi'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

definePage({
  meta: {
    layout: 'blank',
  },
})

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const success = ref(false)
const token = ref('')

const form = reactive({
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  password: '',
  confirmPassword: '',
})

onMounted(() => {
  token.value = route.query.token
  if (!token.value) {
    error.value = 'Invalid or missing reset token'
  }
})

const validate = () => {
  let valid = true
  Object.keys(errors).forEach((key) => (errors[key] = ''))

  if (!form.password) {
    errors.password = 'Password is required'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    valid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    valid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    valid = false
  }

  return valid
}

const handleSubmit = async () => {
  if (!validate()) return

  if (!token.value) {
    error.value = 'Invalid or missing reset token'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authApi.resetPassword({
      token: token.value,
      newPassword: form.password,
    })
    success.value = true
  } catch (err) {
    error.value =
      err.response?.data?.message || 'Failed to reset password. The link may have expired.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.reset-password-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.card-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.reset-password-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
}

.back-to-login {
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  text-decoration: none;
  font-size: 0.875rem;
}

.back-link:hover {
  text-decoration: underline;
}

.success-state {
  text-align: center;
}

.success-icon {
  margin-bottom: 1rem;
}

.success-icon i {
  font-size: 4rem;
  color: #10b981;
}

.success-state h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.success-state p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.w-full {
  width: 100%;
}
</style>
