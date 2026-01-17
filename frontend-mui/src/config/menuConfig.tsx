import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material'
import type { ReactNode } from 'react'

export interface MenuItem {
  label: string
  path: string
  icon: ReactNode
  roles?: string[] // Empty/undefined = accessible to all authenticated users
  section?: string // Optional grouping (e.g., "Administration")
}

export const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    label: 'Notifications',
    path: '/notifications',
    icon: <NotificationsIcon />,
  },
  {
    label: 'Users',
    path: '/users',
    icon: <PeopleIcon />,
    roles: ['Admin'],
    section: 'Administration',
  },
  {
    label: 'Departments',
    path: '/departments',
    icon: <BusinessIcon />,
    roles: ['Admin'],
    section: 'Administration',
  },
]
