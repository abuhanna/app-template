/**
 * @typedef {Object} MenuItem
 * @property {string} label - Display text for the menu item
 * @property {string} path - Route path
 * @property {string} icon - MDI icon name
 * @property {string[]} [roles] - Required roles (empty/undefined = accessible to all)
 * @property {string} [section] - Optional grouping (e.g., "Administration")
 */

/** @type {MenuItem[]} */
export const menuItems = [
  {
    label: 'Notifications',
    path: '/notifications',
    icon: 'mdi-bell',
  },
  {
    label: 'Files',
    path: '/files',
    icon: 'mdi-file-multiple',
    roles: ['Admin'],
    section: 'Administration',
  },
  {
    label: 'Audit Logs',
    path: '/audit-logs',
    icon: 'mdi-history',
    roles: ['Admin'],
    section: 'Administration',
  },
]
