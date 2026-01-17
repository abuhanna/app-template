import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AuthGuard } from './AuthGuard'
import { AdminGuard } from './AdminGuard'
import { DefaultLayout } from '@/layouts/DefaultLayout'
import { BlankLayout } from '@/layouts/BlankLayout'

// Pages
import Login from '@/pages/Login'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import Dashboard from '@/pages/Dashboard'
import Profile from '@/pages/Profile'
import Users from '@/pages/Users'
import Departments from '@/pages/Departments'
import Notifications from '@/pages/Notifications'
import Files from '@/pages/Files'
import AuditLogs from '@/pages/AuditLogs'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  // Public routes (blank layout)
  {
    element: (
      <BlankLayout>
        <Outlet />
      </BlankLayout>
    ),
    children: [
      { path: '/login', element: <Login /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password', element: <ResetPassword /> },
    ],
  },
  // Protected routes (default layout with sidebar)
  {
    element: (
      <AuthGuard>
        <DefaultLayout>
          <Outlet />
        </DefaultLayout>
      </AuthGuard>
    ),
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/profile', element: <Profile /> },
      { path: '/notifications', element: <Notifications /> },
      // Admin-only routes
      {
        element: (
          <AdminGuard>
            <Outlet />
          </AdminGuard>
        ),
        children: [
          { path: '/users', element: <Users /> },
          { path: '/departments', element: <Departments /> },
          { path: '/files', element: <Files /> },
          { path: '/audit-logs', element: <AuditLogs /> },
        ],
      },
    ],
  },
])
