import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AuthGuard } from './AuthGuard'
import { AdminGuard } from './AdminGuard'
import { DefaultLayout } from '@/layouts/DefaultLayout'
import { BlankLayout } from '@/layouts/BlankLayout'

// Pages
import Login from '@/pages/Login'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import Profile from '@/pages/Profile'
import Notifications from '@/pages/Notifications'
import FilesPage from '@/pages/FilesPage'
import AuditLogsPage from '@/pages/AuditLogsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/notifications" replace />,
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
          { path: '/files', element: <FilesPage /> },
          { path: '/audit-logs', element: <AuditLogsPage /> },
        ],
      },
    ],
  },
])
