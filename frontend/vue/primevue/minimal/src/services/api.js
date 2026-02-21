// src/services/api.js
import axios from 'axios'
import router from '@/router'

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
    return Promise.reject(error)
  },
)

// Flag to prevent multiple redirects and refresh attempts
let isRedirecting = false
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  response => {
    return response
  },
  async error => {
    const originalRequest = error.config

    if (error.response) {
      // Handle 401 Unauthorized (token expired or invalid)
      if (error.response.status === 401 && !originalRequest._retry) {
        // Don't try to refresh for auth endpoints
        if (originalRequest.url.includes('/auth/login') ||
            originalRequest.url.includes('/auth/refresh')) {
          return Promise.reject(error)
        }

        // Don't auto-redirect for external API calls
        const currentPath = router.currentRoute.value.fullPath
        if (currentPath.startsWith('/external/') ||
            (originalRequest.url && originalRequest.url.includes('/external/'))) {
          return Promise.reject(error)
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          }).catch(err => {
            return Promise.reject(err)
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          try {
            const response = await axios.post(
              `${api.defaults.baseURL}/auth/refresh`,
              { refreshToken: refreshToken },
              { headers: { 'Content-Type': 'application/json' } }
            )

            const newToken = response.data.token
            const newRefreshToken = response.data.refreshToken

            // Update stored tokens
            localStorage.setItem('token', newToken)
            localStorage.setItem('refreshToken', newRefreshToken)
            localStorage.setItem('refreshTokenExpiresAt', response.data.refreshTokenExpiresAt)
            localStorage.setItem('user', JSON.stringify(response.data.user))

            // Update authorization header
            api.defaults.headers.common.Authorization = `Bearer ${newToken}`
            originalRequest.headers.Authorization = `Bearer ${newToken}`

            // Process queued requests
            processQueue(null, newToken)
            isRefreshing = false

            // Retry original request
            return api(originalRequest)
          } catch (refreshError) {
            processQueue(refreshError, null)
            isRefreshing = false

            // Refresh failed, redirect to login
            if (!isRedirecting) {
              isRedirecting = true

              localStorage.removeItem('token')
              localStorage.removeItem('user')
              localStorage.removeItem('refreshToken')
              localStorage.removeItem('refreshTokenExpiresAt')

              if (currentPath !== '/login') {
                router.push({
                  path: '/login',
                  query: { redirect: currentPath },
                }).finally(() => {
                  setTimeout(() => {
                    isRedirecting = false
                  }, 1000)
                })
              } else {
                isRedirecting = false
              }
            }

            return Promise.reject(refreshError)
          }
        } else {
          // No refresh token, redirect to login
          isRefreshing = false
          if (!isRedirecting) {
            isRedirecting = true

            localStorage.removeItem('token')
            localStorage.removeItem('user')

            if (currentPath !== '/login') {
              router.push({
                path: '/login',
                query: { redirect: currentPath },
              }).finally(() => {
                setTimeout(() => {
                  isRedirecting = false
                }, 1000)
              })
            } else {
              isRedirecting = false
            }
          }
        }
      }

      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.error('Access forbidden:', error.response.data)
      }

      // Handle 500 Server Error
      if (error.response.status === 500) {
        console.error('Server error:', error.response.data)
      }
    } else if (error.request) {
      console.error('Network error - no response received:', error.request)
    } else {
      console.error('Request error:', error.message)
    }

    return Promise.reject(error)
  },
)

export default api
