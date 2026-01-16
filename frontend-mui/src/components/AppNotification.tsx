import { Snackbar, Alert, Stack } from '@mui/material'
import { useNotificationStore } from '@/stores'

export function AppNotification() {
  const notifications = useNotificationStore((state) => state.notifications)
  const removeNotification = useNotificationStore((state) => state.removeNotification)

  return (
    <Stack spacing={1} sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000 }}>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ position: 'relative', mb: 1 }}
        >
          <Alert
            severity={notification.type}
            onClose={() => removeNotification(notification.id)}
            sx={{ width: '100%', minWidth: 300 }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  )
}
