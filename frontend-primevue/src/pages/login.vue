<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <i class="pi pi-box logo-icon"></i>
        <h1 class="login-title">AppTemplate</h1>
        <p class="login-subtitle">Sign in to your account</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <Message v-if="error" severity="error" :closable="false" class="login-error">
          {{ error }}
        </Message>

        <div class="form-field">
          <label for="username">Username</label>
          <InputText
            id="username"
            v-model="form.username"
            placeholder="Enter your username"
            :disabled="loading"
            :invalid="!!errors.username"
            class="w-full"
          />
          <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
        </div>

        <div class="form-field">
          <label for="password">Password</label>
          <Password
            id="password"
            v-model="form.password"
            placeholder="Enter your password"
            :disabled="loading"
            :feedback="false"
            toggleMask
            :invalid="!!errors.password"
            inputClass="w-full"
            class="w-full"
          />
          <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
        </div>

        <div class="form-actions">
          <router-link to="/forgot-password" class="forgot-link">
            Forgot password?
          </router-link>
        </div>

        <Button
          type="submit"
          label="Sign In"
          :loading="loading"
          class="w-full"
          size="large"
        />
      </form>
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
    await authStore.login(form.username, form.password)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Invalid username or password'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.login-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.login-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.login-error {
  margin: 0;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.forgot-link {
  font-size: 0.875rem;
  color: #667eea;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.w-full {
  width: 100%;
}
</style>
