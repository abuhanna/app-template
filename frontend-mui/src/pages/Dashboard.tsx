import { Box, Card, CardContent, Typography, Grid } from '@mui/material'
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material'
import { useAuthStore, usePersistentNotificationStore } from '@/stores'

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const unreadCount = usePersistentNotificationStore((state) => state.unreadCount)

  const stats = [
    {
      title: 'Welcome',
      value: `${user?.firstName || user?.username}`,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Department',
      value: user?.departmentName || 'N/A',
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Notifications',
      value: unreadCount.toString(),
      icon: <NotificationsIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: `${stat.color}15`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Info
          </Typography>
          <Typography color="text.secondary">
            Welcome to AppTemplate! This is a fullstack application template with authentication,
            user management, and real-time notifications.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
