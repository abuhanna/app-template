export interface MenuItem {
  label: string
  path: string
  icon: string // PrimeIcons class name
  roles?: string[] // Empty/undefined = accessible to all authenticated users
  section?: string // Optional grouping (e.g., "Administration")
}

export const menuItems: MenuItem[] = [
  {
    label: 'Notifications',
    path: '/notifications',
    icon: 'pi pi-bell',
  },
  {
    label: 'Files',
    path: '/files',
    icon: 'pi pi-file',
    roles: ['Admin'],
    section: 'Administration',
  },
  {
    label: 'Audit Logs',
    path: '/audit-logs',
    icon: 'pi pi-history',
    roles: ['Admin'],
    section: 'Administration',
  },
]
