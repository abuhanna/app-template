import {
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
    label: 'Notifications',
    path: '/notifications',
    icon: <NotificationsIcon />,
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
