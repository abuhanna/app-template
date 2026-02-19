import { useState, useEffect, useRef } from 'react'
import { Toast } from 'primereact/toast'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { usePersistentNotificationStore, useNotificationStore } from '@/stores'

interface DefaultLayoutProps {
  children: React.ReactNode
}

const SIDEBAR_WIDTH = 260
const SIDEBAR_COLLAPSED_WIDTH = 64

// Map notification types to PrimeReact Toast severities
const mapSeverity = (type: string): 'success' | 'info' | 'warn' | 'error' => {
  if (type === 'warning') return 'warn'
  return type as 'success' | 'info' | 'error'
}

export function DefaultLayout({ children }: DefaultLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const toast = useRef<Toast>(null)
  const shownNotifications = useRef<Set<string>>(new Set())
  const initConnection = usePersistentNotificationStore((state) => state.initConnection)
  const disconnect = usePersistentNotificationStore((state) => state.disconnect)
  const notifications = useNotificationStore((state) => state.notifications)

  useEffect(() => {
    initConnection()
    return () => {
      disconnect()
    }
  }, [initConnection, disconnect])

  // Show toast notifications
  useEffect(() => {
    if (notifications?.length > 0 && toast.current) {
      notifications.forEach((notification) => {
        // Only show each notification once
        if (!shownNotifications.current.has(notification.id)) {
          shownNotifications.current.add(notification.id)
          toast.current?.show({
            severity: mapSeverity(notification.type),
            summary: notification.type.charAt(0).toUpperCase() + notification.type.slice(1),
            detail: notification.message,
            life: notification.duration,
          })
          // Remove from store after showing
          setTimeout(() => {
            useNotificationStore.getState().removeNotification(notification.id)
          }, 100)
        }
      })
    }
  }, [notifications])

  const currentSidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  return (
    <div className="layout-wrapper">
      <Toast ref={toast} position="top-right" />
      <AppSidebar collapsed={sidebarCollapsed} />
      <div
        className="layout-main-container"
        style={{ marginLeft: currentSidebarWidth }}
      >
        <AppHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="layout-main">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  )
}
