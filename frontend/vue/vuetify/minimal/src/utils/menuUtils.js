/**
 * Filter menu items based on user role
 * Items without roles property are accessible to all authenticated users
 *
 * @param {import('@/config/menuConfig').MenuItem[]} items - Menu items to filter
 * @param {string} [userRole] - Current user's role
 * @returns {import('@/config/menuConfig').MenuItem[]} Filtered menu items
 */
export function filterMenuByRole(items, userRole) {
  return items.filter((item) => {
    // No roles specified = accessible to all authenticated users
    if (!item.roles || item.roles.length === 0) {
      return true
    }
    // Check if user's role is in the allowed roles
    return userRole && item.roles.includes(userRole)
  })
}

/**
 * Group menu items by section
 * Returns a Map where key is section name (undefined for items without section)
 *
 * @param {import('@/config/menuConfig').MenuItem[]} items - Menu items to group
 * @returns {Map<string|undefined, import('@/config/menuConfig').MenuItem[]>} Grouped menu items
 */
export function groupMenuBySection(items) {
  const groups = new Map()

  items.forEach((item) => {
    const section = item.section
    if (!groups.has(section)) {
      groups.set(section, [])
    }
    groups.get(section).push(item)
  })

  return groups
}

/**
 * Check if user has access to a specific menu item
 *
 * @param {import('@/config/menuConfig').MenuItem} item - Menu item to check
 * @param {string} [userRole] - Current user's role
 * @returns {boolean} Whether user has access
 */
export function hasMenuAccess(item, userRole) {
  if (!item.roles || item.roles.length === 0) {
    return true
  }
  return userRole ? item.roles.includes(userRole) : false
}
