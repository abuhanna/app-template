import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Badge } from 'primereact/badge'
import { OverlayPanel } from 'primereact/overlaypanel'
import { usePersistentNotificationStore } from '@/stores'

export function NotificationMenu() {
  const navigate = useNavigate()
  const op = useRef<OverlayPanel>(null)
  const notifications = usePersistentNotificationStore((state) => state.notifications)
  const unreadCount = usePersistentNotificationStore((state) => state.unreadCount)
  const markAsRead = usePersistentNotificationStore((state) => state.markAsRead)
  const markAllAsRead = usePersistentNotificationStore((state) => state.markAllAsRead)

  const recentNotifications = (notifications || []).slice(0, 5)

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id)
  }

  const handleViewAll = () => {
    op.current?.hide()
    navigate('/notifications')
  }

  return (
    <>
      <Button
        icon="pi pi-bell"
        text
        className="p-button-rounded relative"
        onClick={(e) => op.current?.toggle(e)}
      >
        {unreadCount > 0 && (
          <Badge value={unreadCount} severity="danger" className="absolute" style={{ top: 0, right: 0 }} />
        )}
      </Button>

      <OverlayPanel ref={op} style={{ width: '360px' }}>
        <div className="flex justify-content-between align-items-center mb-3">
          <span className="text-xl font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button label="Mark all read" text size="small" onClick={() => markAllAsRead()} />
          )}
        </div>

        {recentNotifications.length === 0 ? (
          <div className="text-center py-4 text-500">No notifications</div>
        ) : (
          <div className="flex flex-column gap-2">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-round cursor-pointer ${
                  notification.isRead ? 'surface-ground' : 'surface-100'
                }`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className={`font-${notification.isRead ? 'normal' : 'semibold'}`}>
                  {notification.title}
                </div>
                <div className="text-500 text-sm">{notification.message}</div>
              </div>
            ))}
          </div>
        )}

        <div className="border-top-1 surface-border pt-3 mt-3">
          <Button label="View all notifications" text className="w-full" onClick={handleViewAll} />
        </div>
      </OverlayPanel>
    </>
  )
}
