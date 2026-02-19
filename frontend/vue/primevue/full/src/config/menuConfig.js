/**
 * @typedef {Object} MenuItem
 * @property {string} label - Display text for the menu item
 * @property {string} path - Route path
 * @property {string} icon - PrimeIcons class name
 * @property {string[]} [roles] - Required roles (empty/undefined = accessible to all)
 * @property {string} [section] - Optional grouping (e.g., "Administration")
 */

/** @type {MenuItem[]} */
export const menuItems = [
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
