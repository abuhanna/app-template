import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconButton,
  Badge,
  Menu,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
} from '@mui/material'
import { Notifications as NotificationsIcon } from '@mui/icons-material'
import { usePersistentNotificationStore } from '@/stores'

export function NotificationMenu() {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const notifications = usePersistentNotificationStore((state) => state.notifications)
  const unreadCount = usePersistentNotificationStore((state) => state.unreadCount)
  const markAsRead = usePersistentNotificationStore((state) => state.markAsRead)
  const markAllAsRead = usePersistentNotificationStore((state) => state.markAllAsRead)

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const handleViewAll = () => {
    handleClose()
    navigate('/notifications')
  }

  const recentNotifications = notifications.slice(0, 5)

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { width: 360, maxHeight: 400 },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>

        <Divider />

        {recentNotifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {recentNotifications.map((notification) => (
              <ListItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected',
                  },
                }}
              >
                <ListItemText
                  primary={notification.title}
                  secondary={notification.message}
                  primaryTypographyProps={{
                    fontWeight: notification.isRead ? 'normal' : 'bold',
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}

        <Divider />

        <Box sx={{ p: 1 }}>
          <Button fullWidth onClick={handleViewAll}>
            View all notifications
          </Button>
        </Box>
      </Menu>
    </>
  )
}
