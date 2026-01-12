/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

import { setupLayouts } from 'virtual:generated-layouts'
// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { useNotificationStore } from '@/stores/notification'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

// Navigation guard for authentication and authorization
router.beforeEach((to, from, next) => {
  // Handle legacy hash-style URLs (e.g., /#/dashboard)
  if (to.path === '/' && window.location.hash.startsWith('#/')) {
    const hashPath = window.location.hash.slice(1)
    if (hashPath.length > 1) {
      next(hashPath)
      return
    }
  }

  const token = localStorage.getItem('token')
  const isAuthenticated = !!token

  // Get user data from localStorage
  let user = null
  try {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      user = JSON.parse(storedUser)
    }
  } catch (error) {
    console.error('Error parsing user data:', error)
  }

  // Public pages that don't require authentication
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)

  // Pages restricted to admin role only
  const adminOnlyPages = ['/users', '/departments']

  // Check if current route is admin-only
  const isAdminOnlyPage = adminOnlyPages.some(page => to.path.startsWith(page))

  // If accessing root ("/"), redirect based on auth status
  if (to.path === '/') {
    if (isAuthenticated) {
      next('/dashboard')
    } else {
      next('/login')
    }
    return
  }

  // If page requires auth and user is not logged in
  if (authRequired && !isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
    return
  }

  // If user is logged in and tries to access login page
  if (to.path === '/login' && isAuthenticated) {
    next('/dashboard')
    return
  }

  // Check role-based access control
  // Only Admin role can access admin pages
  if (isAdminOnlyPage && user?.role !== 'Admin') {
    const notificationStore = useNotificationStore()
    notificationStore.showError('Access denied. You do not have permission to view this page.')
    console.warn(`Access denied: User ${user?.id} attempted to access ${to.path}`)
    next('/dashboard')
    return
  }

  next()
})

// Workaround for dynamic import errors
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      if (import.meta.env.DEV) console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
