// src/services/api.js
import axios from 'axios'
import router from '@/router'
import { useNotificationStore } from '@/stores/notification'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5100/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add JWT token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    throw error
  },
)

// Flag to prevent multiple redirects and refresh attempts
let isRedirecting = false
let isRefreshing = false
let failedQueue = []

function processQueue (error, token = null) {
  for (const prom of failedQueue) {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  }
  failedQueue = []
}

function clearAuthStorage () {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('refreshTokenExpiresAt')
}

function redirectToLogin (currentPath) {
  if (isRedirecting) {
    return
  }
  isRedirecting = true
  clearAuthStorage()

  if (currentPath === '/login') {
    isRedirecting = false
  } else {
    router.push({
      path: '/login',
      query: { redirect: currentPath },
    }).finally(() => {
      setTimeout(() => {
        isRedirecting = false
      }, 1000)
    })
  }
}

function getErrorMessage (status, responseData) {
  const errors = responseData?.errors
  if (errors && Array.isArray(errors) && errors.length > 0) {
    return errors.join('. ')
  }
  if (responseData?.message) {
    return responseData.message
  }
  switch (status) {
    case 403: {
      return 'You don\'t have permission to perform this action.'
    }
    case 404: {
      return 'Resource not found.'
    }
    case 422: {
      return 'Validation error.'
    }
    case 500: {
      return 'Server error. Please try again later.'
    }
    default: {
      return 'An error occurred.'
    }
  }
}

function showErrorToast (message) {
  try {
    const notificationStore = useNotificationStore()
    notificationStore.showError(message)
  } catch {
    console.error(message)
  }
}

function isAuthUrl (url) {
  return url?.includes('/auth/login')
    || url?.includes('/auth/refresh')
}

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response) {
      // Handle 401 Unauthorized (token expired or invalid)
      if (error.response.status === 401 && !originalRequest._retry) {
        if (isAuthUrl(originalRequest.url)) {
          throw error
        }

        const currentPath = router.currentRoute.value.fullPath
        if (currentPath.startsWith('/external/')
          || originalRequest.url?.includes('/external/')) {
          throw error
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          try {
            const response = await axios.post(
              `${api.defaults.baseURL}/auth/refresh`,
              { refreshToken },
              { headers: { 'Content-Type': 'application/json' } },
            )

            const newToken = response.data.data.accessToken
            const newRefreshToken = response.data.data.refreshToken

            localStorage.setItem('token', newToken)
            localStorage.setItem('refreshToken', newRefreshToken)

            api.defaults.headers.common.Authorization = `Bearer ${newToken}`
            originalRequest.headers.Authorization = `Bearer ${newToken}`

            processQueue(null, newToken)
            isRefreshing = false

            return api(originalRequest)
          } catch (refreshError) {
            processQueue(refreshError, null)
            isRefreshing = false
            redirectToLogin(currentPath)
            throw refreshError
          }
        } else {
          isRefreshing = false
          redirectToLogin(currentPath)
        }
      }

      // Handle non-401 errors with user-facing messages
      if (error.response.status !== 401) {
        const message = getErrorMessage(error.response.status, error.response.data)
        const isAuthEndpoint = originalRequest?.url?.includes('/auth/')
        if (!isAuthEndpoint) {
          showErrorToast(message)
        }
      }
    } else if (error.request) {
      showErrorToast('Connection failed. Please check your internet.')
    } else {
      console.error('Request error:', error.message)
    }

    throw error
  },
)

export default api
