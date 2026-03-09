<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <div class="card-header">
        <i class="pi pi-lock logo-icon" />
        <h1 class="card-title">Forgot Password</h1>
        <p class="card-subtitle">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form v-if="!submitted" class="forgot-password-form" @submit.prevent="handleSubmit">
        <Message v-if="error" :closable="false" severity="error">
          {{ error }}
        </Message>

        <div class="form-field">
          <label for="email">Email Address</label>
          <InputText
            id="email"
            v-model="email"
            class="w-full"
            :disabled="loading"
            :invalid="!!emailError"
            placeholder="Enter your email"
            type="email"
          />
          <small v-if="emailError" class="p-error">{{ emailError }}</small>
        </div>

        <Button
          class="w-full"
          label="Send Reset Link"
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
        <h2>Check Your Email</h2>
        <p>
          If an account exists for <strong>{{ email }}</strong>, you will receive a password
          reset link shortly.
        </p>
        <Button
          class="w-full"
          label="Back to Login"
          severity="secondary"
          @click="$router.push('/login')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
  import Button from 'primevue/button'
  import InputText from 'primevue/inputtext'
  import Message from 'primevue/message'
  import { ref } from 'vue'
  import authApi from '@/services/authApi'

  definePage({
    meta: {
      layout: 'blank',
    },
  })

  const email = ref('')
  const emailError = ref('')
  const error = ref('')
  const loading = ref(false)
  const submitted = ref(false)

  function validate () {
    emailError.value = ''

    if (!email.value.trim()) {
      emailError.value = 'Email is required'
      return false
    }

    if (!/\S+@\S+\.\S+/.test(email.value)) {
      emailError.value = 'Invalid email format'
      return false
    }

    return true
  }

  async function handleSubmit () {
    if (!validate()) return

    loading.value = true
    error.value = ''

    try {
      await authApi.forgotPassword(email.value)
      submitted.value = true
    } catch {
      // Don't reveal if email exists or not
      submitted.value = true
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.forgot-password-card {
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
  margin: 0 0 0.75rem 0;
}

.card-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.forgot-password-form {
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
