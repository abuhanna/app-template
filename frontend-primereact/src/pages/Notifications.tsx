import { useEffect } from 'react'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { usePersistentNotificationStore } from '@/stores/persistentNotificationStore'
import type { Notification } from '@/types/notification'

export default function Notifications() {
  const notifications = usePersistentNotificationStore((state) => state.notifications)
  const loading = usePersistentNotificationStore((state) => state.loading)
  const unreadCount = usePersistentNotificationStore((state) => state.unreadCount)
  const fetchNotifications = usePersistentNotificationStore((state) => state.fetchNotifications)
  const markAsRead = usePersistentNotificationStore((state) => state.markAsRead)
  const markAllAsRead = usePersistentNotificationStore((state) => state.markAllAsRead)

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getSeverityColor = (type: Notification['type']) => {
    const colors: Record<Notification['type'], 'info' | 'success' | 'warning' | 'danger'> = {
      info: 'info',
      success: 'success',
      warning: 'warning',
      error: 'danger',
    }
    return colors[type]
  }

  const getSeverityIcon = (type: Notification['type']) => {
    const icons: Record<Notification['type'], string> = {
      info: 'pi pi-info-circle',
      success: 'pi pi-check-circle',
      warning: 'pi pi-exclamation-triangle',
      error: 'pi pi-times-circle',
    }
    return icons[type]
  }

  return (
    <div>
      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <div className="text-3xl font-bold">Notifications</div>
          {unreadCount > 0 && (
            <span className="text-500">{unreadCount} unread notification(s)</span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            label="Mark All as Read"
            icon="pi pi-check-double"
            outlined
            onClick={() => markAllAsRead()}
          />
        )}
      </div>

      {loading ? (
        <div className="flex justify-content-center py-6">
          <i className="pi pi-spin pi-spinner text-4xl text-500" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <div className="text-center py-6">
            <i className="pi pi-inbox text-6xl text-300 mb-4" />
            <div className="text-xl text-500">No notifications</div>
            <div className="text-500">You're all caught up!</div>
          </div>
        </Card>
      ) : (
        <div className="flex flex-column gap-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.isRead ? 'surface-ground' : 'surface-card border-left-3 border-primary'}
            >
              <div className="flex justify-content-between align-items-start">
                <div className="flex gap-3 flex-1">
                  <div
                    className="flex align-items-center justify-content-center border-round flex-shrink-0"
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      backgroundColor: `var(--${getSeverityColor(notification.type)}-100)`,
                    }}
                  >
                    <i
                      className={`${getSeverityIcon(notification.type)} text-${getSeverityColor(notification.type)}-500`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex align-items-center gap-2 mb-1">
                      <span className={`font-${notification.isRead ? 'normal' : 'semibold'} text-900`}>
                        {notification.title}
                      </span>
                      <Tag
                        value={notification.type}
                        severity={getSeverityColor(notification.type)}
                        className="text-xs"
                      />
                    </div>
                    <div className="text-600 mb-2">{notification.message}</div>
                    <div className="text-500 text-sm">{formatDate(notification.createdAt)}</div>
                  </div>
                </div>
                {!notification.isRead && (
                  <Button
                    icon="pi pi-check"
                    rounded
                    text
                    severity="secondary"
                    tooltip="Mark as read"
                    tooltipOptions={{ position: 'left' }}
                    onClick={() => markAsRead(notification.id)}
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
