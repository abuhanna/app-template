import { useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Avatar } from 'primereact/avatar'
import { Menu } from 'primereact/menu'
import { useAuthStore, useThemeStore, ThemeMode } from '@/stores'
import { NotificationMenu } from '@/components/common/NotificationMenu'
import { ConfirmDialog } from '@/components'

interface AppHeaderProps {
  onToggleSidebar: () => void
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/profile': 'Profile',
  '/users': 'User Management',
  '/departments': 'Department Management',
  '/notifications': 'Notifications',
}

export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const themeMode = useThemeStore((state) => state.themeMode)
  const setTheme = useThemeStore((state) => state.setTheme)
  const menu = useRef<Menu>(null)
  const themeMenu = useRef<Menu>(null)
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false)

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return 'pi pi-sun'
      case 'dark':
        return 'pi pi-moon'
      default:
        return 'pi pi-desktop'
    }
  }

  const themeMenuItems = [
    {
      label: 'Light',
      icon: 'pi pi-sun',
      command: () => setTheme('light'),
    },
    {
      label: 'Dark',
      icon: 'pi pi-moon',
      command: () => setTheme('dark'),
    },
    {
      label: 'System',
      icon: 'pi pi-desktop',
      command: () => setTheme('system'),
    },
  ]

  const pageTitle = pageTitles[location.pathname] || 'AppTemplate'

  const handleLogoutClick = () => {
    setLogoutDialogVisible(true)
  }

  const handleLogoutConfirm = async () => {
    setLogoutDialogVisible(false)
    await logout()
    navigate('/login')
  }

  const handleLogoutCancel = () => {
    setLogoutDialogVisible(false)
  }

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }
    return user?.username?.[0]?.toUpperCase() || 'U'
  }

  const menuItems = [
    {
      label: user?.name || user?.username,
      disabled: true,
      style: { opacity: 1, fontWeight: 'bold' },
    },
    { separator: true },
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => navigate('/profile'),
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: handleLogoutClick,
    },
  ]

  return (
    <>
      <header
        className="flex align-items-center justify-content-between px-4 py-3 surface-card shadow-1"
        style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--surface-border)' }}
      >
        <div className="flex align-items-center gap-3">
          <Button
            icon="pi pi-bars"
            text
            onClick={onToggleSidebar}
            className="p-button-text"
          />
          <span className="text-xl font-semibold">{pageTitle}</span>
        </div>

        <div className="flex align-items-center gap-2">
          {/* Theme Toggle */}
          <Menu model={themeMenuItems} popup ref={themeMenu} />
          <Button
            icon={getThemeIcon()}
            text
            rounded
            onClick={(e) => themeMenu.current?.toggle(e)}
            className="p-button-text"
          />

          <NotificationMenu />

          <Menu model={menuItems} popup ref={menu} />
          <Button
            className="p-button-text"
            onClick={(e) => menu.current?.toggle(e)}
          >
            <Avatar label={getInitials()} shape="circle" className="bg-primary" />
          </Button>
        </div>
      </header>

      <ConfirmDialog
        visible={logoutDialogVisible}
        title="Sign Out"
        message="Are you sure you want to sign out? You will be redirected to the login page."
        confirmLabel="Sign Out"
        cancelLabel="Stay Logged In"
        confirmSeverity="warning"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </>
  )
}
