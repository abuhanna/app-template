import type { MenuItem } from '@/config/menuConfig'

/**
 * Filter menu items based on user role
 * Items without roles property are accessible to all authenticated users
 */
export function filterMenuByRole(items: MenuItem[], userRole?: string): MenuItem[] {
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
 */
export function groupMenuBySection(items: MenuItem[]): Map<string | undefined, MenuItem[]> {
  const groups = new Map<string | undefined, MenuItem[]>()

  items.forEach((item) => {
    const section = item.section
    if (!groups.has(section)) {
      groups.set(section, [])
    }
    groups.get(section)!.push(item)
  })

  return groups
}

/**
 * Check if user has access to a specific menu item
 */
export function hasMenuAccess(item: MenuItem, userRole?: string): boolean {
  if (!item.roles || item.roles.length === 0) {
    return true
  }
  return userRole ? item.roles.includes(userRole) : false
}
