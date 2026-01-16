import { useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from 'primereact/sidebar'
import { Menu } from 'primereact/menu'
import { useAuthStore } from '@/stores'

interface AppSidebarProps {
  visible: boolean
  onHide: () => void
  width: number
}

export function AppSidebar({ visible, onHide, width }: AppSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'Admin'

  const navItems = [
    { label: 'Dashboard', icon: 'pi pi-home', path: '/dashboard' },
    ...(isAdmin
      ? [
          { label: 'Users', icon: 'pi pi-users', path: '/users' },
          { label: 'Departments', icon: 'pi pi-building', path: '/departments' },
        ]
      : []),
    { label: 'Notifications', icon: 'pi pi-bell', path: '/notifications' },
  ]

  const menuItems = navItems.map((item) => ({
    label: item.label,
    icon: item.icon,
    className: location.pathname === item.path ? 'bg-primary text-white' : '',
    command: () => navigate(item.path),
  }))

  const sidebarContent = (
    <div className="flex flex-column h-full">
      <div className="p-3 flex align-items-center gap-2 border-bottom-1 surface-border">
        <div
          className="flex align-items-center justify-content-center bg-primary text-white border-round"
          style={{ width: 40, height: 40 }}
        >
          <span className="text-xl font-bold">A</span>
        </div>
        <span className="text-xl font-bold">AppTemplate</span>
      </div>

      <Menu model={menuItems} className="w-full border-none" />

      <div className="mt-auto p-3 border-top-1 surface-border">
        <small className="text-500">© 2024 AppTemplate</small>
      </div>
    </div>
  )

  return (
    <Sidebar
      visible={visible}
      onHide={onHide}
      modal={false}
      showCloseIcon={false}
      style={{ width }}
      className="surface-ground"
    >
      {sidebarContent}
    </Sidebar>
  )
}
