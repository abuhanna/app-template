import { useLocation, useNavigate } from 'react-router-dom'
import { Tooltip } from 'primereact/tooltip'
import { useAuthStore } from '@/stores'
import { menuItems } from '@/config/menuConfig'
import { filterMenuByRole, groupMenuBySection } from '@/utils/menuUtils'

interface AppSidebarProps {
  collapsed: boolean
}

export function AppSidebar({ collapsed }: AppSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const filteredItems = filterMenuByRole(menuItems, user?.role)
  const groupedItems = groupMenuBySection(filteredItems)

  // Get items without section (main menu) and items with sections
  const mainMenuItems = groupedItems.get(undefined) || []
  const sectionEntries = Array.from(groupedItems.entries()).filter(([key]) => key !== undefined)

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const handleNavClick = (path: string) => {
    navigate(path)
  }

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="logo-container">
          <i className="pi pi-box logo-icon"></i>
          {!collapsed && <span className="logo-text">AppTemplate</span>}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {/* Main Menu Items (no section) */}
        <ul className="nav-list">
          {mainMenuItems.map((item) => (
            <li key={item.path}>
              <a
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => handleNavClick(item.path)}
                data-pr-tooltip={item.label}
                data-pr-position="right"
                data-pr-disabled={!collapsed}
              >
                <i className={item.icon}></i>
                {!collapsed && <span>{item.label}</span>}
              </a>
              {collapsed && <Tooltip target={`[data-pr-tooltip="${item.label}"]`} />}
            </li>
          ))}
        </ul>

        {/* Sectioned Menu Items */}
        {sectionEntries.map(([sectionName, items]) => (
          <div key={sectionName} className="nav-section">
            {!collapsed && <span className="nav-section-title">{sectionName}</span>}
            <ul className="nav-list">
              {items.map((item) => (
                <li key={item.path}>
                  <a
                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.path)}
                    data-pr-tooltip={item.label}
                    data-pr-position="right"
                    data-pr-disabled={!collapsed}
                  >
                    <i className={item.icon}></i>
                    {!collapsed && <span>{item.label}</span>}
                  </a>
                  {collapsed && <Tooltip target={`[data-pr-tooltip="${item.label}"]`} />}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
