import { useLocation, useNavigate } from 'react-router-dom'
import { Tooltip } from 'primereact/tooltip'
import { useAuthStore } from '@/stores'

interface AppSidebarProps {
  collapsed: boolean
}

export function AppSidebar({ collapsed }: AppSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'Admin'

  const menuItems = [
    { label: 'Dashboard', icon: 'pi pi-home', path: '/dashboard' },
    { label: 'Notifications', icon: 'pi pi-bell', path: '/notifications' },
  ]

  const adminMenuItems = [
    { label: 'Users', icon: 'pi pi-users', path: '/users' },
    { label: 'Departments', icon: 'pi pi-building', path: '/departments' },
  ]

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
        <ul className="nav-list">
          {menuItems.map((item) => (
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

        {/* Admin Section */}
        {isAdmin && (
          <div className="nav-section">
            {!collapsed && <span className="nav-section-title">Administration</span>}
            <ul className="nav-list">
              {adminMenuItems.map((item) => (
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
        )}
      </nav>
    </aside>
  )
}
