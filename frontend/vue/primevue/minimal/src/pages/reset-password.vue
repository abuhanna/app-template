<template>
  <div class="reset-password-container">
    <div class="reset-password-card">
      <div class="card-header">
        <i class="pi pi-lock logo-icon" />
        <h1 class="card-title">Reset Password</h1>
        <p class="card-subtitle">Enter your new password below.</p>
      </div>

      <form v-if="!success" class="reset-password-form" @submit.prevent="handleSubmit">
        <Message v-if="error" :closable="false" severity="error">
          {{ error }}
        </Message>

        <div class="form-field">
          <label for="password">New Password</label>
          <Password
            id="password"
            v-model="form.password"
            class="w-full"
            :disabled="loading"
            input-class="w-full"
            :invalid="!!errors.password"
            placeholder="Enter new password"
            toggle-mask
          />
          <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
        </div>

        <div class="form-field">
          <label for="confirmPassword">Confirm Password</label>
          <Password
            id="confirmPassword"
            v-model="form.confirmPassword"
            class="w-full"
            :disabled="loading"
            :feedback="false"
            input-class="w-full"
            :invalid="!!errors.confirmPassword"
            placeholder="Confirm new password"
            toggle-mask
          />
          <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
        </div>

        <Button
          class="w-full"
          label="Reset Password"
          :loading="loading"
          size="large"
          type="submit"
        />

        <div class="back-to-login">
          <router-link class="back-link" to="/login">
            <i class="pi pi-arrow-left" />
            Back to Login
          </router-link>
        </div>
      </form>

      <div v-else class="success-state">
        <div class="success-icon">
          <i class="pi pi-check-circle" />
        </div>
        <h2>Password Reset Successful</h2>
        <p>Your password has been successfully reset. You can now login with your new password.</p>
        <Button
          class="w-full"
          label="Go to Login"
          @click="$router.push('/login')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
  import Button from 'primevue/button'
  import Message from 'primevue/message'
  import Password from 'primevue/password'
  import { onMounted, reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import authApi from '@/services/authApi'

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

  function validate () {
    let valid = true
    for (const key of Object.keys(errors)) (errors[key] = '')

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

  async function handleSubmit () {
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
    } catch (error_) {
      error.value
        = error_.response?.data?.message || 'Failed to reset password. The link may have expired.'
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
  background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 50%, #1b263b 100%);
}

.reset-password-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  font-size: 3rem;
  color: #6366f1;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.card-subtitle {
  font-size: 0.875rem;
  color: #64748b;
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
  font-weight: 600;
  font-size: 0.875rem;
  color: #334155;
}

.back-to-login {
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6366f1;
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
  color: #0f172a;
  margin: 0 0 0.75rem 0;
}

.success-state p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.w-full {
  width: 100%;
}
</style>
