import { useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  Divider,
} from '@mui/material'
import {
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MarkEmailRead as MarkReadIcon,
} from '@mui/icons-material'
import { usePersistentNotificationStore } from '@/stores'
import type { Notification } from '@/types'

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return <SuccessIcon color="success" />
    case 'warning':
      return <WarningIcon color="warning" />
    case 'error':
      return <ErrorIcon color="error" />
    default:
      return <InfoIcon color="info" />
  }
}

export default function Notifications() {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, unreadCount } =
    usePersistentNotificationStore()

  useEffect(() => {
    fetchNotifications({ limit: 50 })
  }, [fetchNotifications])

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Notifications</Typography>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            startIcon={<MarkReadIcon />}
            onClick={handleMarkAllAsRead}
          >
            Mark all as read ({unreadCount})
          </Button>
        )}
      </Box>

      <Card>
        <CardContent>
          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No notifications</Typography>
            </Box>
          ) : (
            <List>
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem
                    sx={{
                      backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                      borderRadius: 1,
                      cursor: notification.isRead ? 'default' : 'pointer',
                    }}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  >
                    <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            fontWeight={notification.isRead ? 'normal' : 'bold'}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.isRead && (
                            <Chip label="New" color="primary" size="small" />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {notification.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            {new Date(notification.createdAt).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
