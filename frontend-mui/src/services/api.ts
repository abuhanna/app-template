import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { router } from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5100/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

// Helper to extract error message from response
const getErrorMessage = (error: AxiosError): string => {
  const data = error.response?.data as {
    message?: string
    title?: string
    errors?: Record<string, string[]>
  }

  if (data?.message) return data.message
  if (data?.title) return data.title
  if (data?.errors) {
    const firstError = Object.values(data.errors)[0]
    if (firstError?.[0]) return firstError[0]
  }

  switch (error.response?.status) {
    case 400:
      return 'Invalid request'
    case 401:
      return 'Authentication required'
    case 403:
      return 'Access denied'
    case 404:
      return 'Resource not found'
    case 500:
      return 'Server error'
    default:
      return error.message || 'An error occurred'
  }
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const success = await useAuthStore.getState().refreshTokens()
        if (success) {
          const newToken = useAuthStore.getState().token
          processQueue(null, newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        } else {
          processQueue(error, null)
          useAuthStore.getState().clearAuth()
          router.navigate('/login', {
            state: { from: { pathname: window.location.pathname + window.location.search } },
            replace: true,
          })
          return Promise.reject(error)
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().clearAuth()
        router.navigate('/login', {
          state: { from: { pathname: window.location.pathname + window.location.search } },
          replace: true,
        })
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Show error toast for non-401 errors (401 is handled above with redirect)
    // Skip auth endpoints as they handle their own error display
    const isAuthEndpoint = originalRequest.url?.includes('/auth/')
    if (error.response?.status !== 401 && !isAuthEndpoint) {
      const message = getErrorMessage(error)
      useNotificationStore.getState().showError(message)
    }

    return Promise.reject(error)
  }
)

export default api
