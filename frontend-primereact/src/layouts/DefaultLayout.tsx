import { useState, useEffect } from 'react'
import { Toast } from 'primereact/toast'
import { useRef } from 'react'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { usePersistentNotificationStore, useNotificationStore } from '@/stores'

interface DefaultLayoutProps {
  children: React.ReactNode
}

const DRAWER_WIDTH = 260

// Map notification types to PrimeReact Toast severities
const mapSeverity = (type: string): 'success' | 'info' | 'warn' | 'error' => {
  if (type === 'warning') return 'warn'
  return type as 'success' | 'info' | 'error'
}

export function DefaultLayout({ children }: DefaultLayoutProps) {
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const toast = useRef<Toast>(null)
  const initConnection = usePersistentNotificationStore((state) => state.initConnection)
  const disconnect = usePersistentNotificationStore((state) => state.disconnect)
  const notifications = useNotificationStore((state) => state.notifications)
  const removeNotification = useNotificationStore((state) => state.removeNotification)

  useEffect(() => {
    initConnection()
    return () => {
      disconnect()
    }
  }, [initConnection, disconnect])

  // Show toast notifications
  useEffect(() => {
    if (notifications.length > 0 && toast.current) {
      const notification = notifications[notifications.length - 1]
      toast.current.show({
        severity: mapSeverity(notification.type),
        summary: notification.type.charAt(0).toUpperCase() + notification.type.slice(1),
        detail: notification.message,
        life: notification.duration,
      })
      setTimeout(() => removeNotification(notification.id), 100)
    }
  }, [notifications, removeNotification])

  return (
    <div className="layout-wrapper">
      <Toast ref={toast} position="top-right" />
      <AppSidebar visible={sidebarVisible} onHide={() => setSidebarVisible(false)} width={DRAWER_WIDTH} />
      <div
        className="layout-main-container"
        style={{ marginLeft: sidebarVisible ? DRAWER_WIDTH : 0 }}
      >
        <AppHeader onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} />
        <main className="layout-main">{children}</main>
      </div>
    </div>
  )
}
