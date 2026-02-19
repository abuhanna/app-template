import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Notifications as NotificationsIcon,
  Folder as FolderIcon,
  History as HistoryIcon,
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
  {
    label: 'Files',
    path: '/files',
    icon: <FolderIcon />,
    roles: ['Admin'],
    section: 'Administration',
  },
  {
    label: 'Audit Logs',
    path: '/audit-logs',
    icon: <HistoryIcon />,
    roles: ['Admin'],
    section: 'Administration',
  },
]
