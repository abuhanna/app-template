export interface MenuItem {
  label: string
  path: string
  icon: string // PrimeIcons class name
  roles?: string[] // Empty/undefined = accessible to all authenticated users
  section?: string // Optional grouping (e.g., "Administration")
}

export const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'pi pi-home',
  },
  {
    label: 'Notifications',
    path: '/notifications',
    icon: 'pi pi-bell',
  },
  {
    label: 'Users',
    path: '/users',
    icon: 'pi pi-users',
    roles: ['Admin'],
    section: 'Administration',
  },
  {
    label: 'Departments',
    path: '/departments',
    icon: 'pi pi-building',
    roles: ['Admin'],
    section: 'Administration',
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
