import { useRef, useEffect } from 'react'
import { Toast } from 'primereact/toast'
import { useNotificationStore } from '@/stores'

interface BlankLayoutProps {
  children: React.ReactNode
}

// Map notification types to PrimeReact Toast severities
const mapSeverity = (type: string): 'success' | 'info' | 'warn' | 'error' => {
  if (type === 'warning') return 'warn'
  return type as 'success' | 'info' | 'error'
}

export function BlankLayout({ children }: BlankLayoutProps) {
  const toast = useRef<Toast>(null)
  const shownNotifications = useRef<Set<string>>(new Set())
  const notifications = useNotificationStore((state) => state.notifications)

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

  return (
    <div className="min-h-screen flex flex-column">
      <Toast ref={toast} position="top-right" />
      {children}
    </div>
  )
}
