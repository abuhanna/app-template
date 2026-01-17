import { useEffect, useState, useMemo } from 'react'
import { Box, Card, CardContent, Typography, Grid } from '@mui/material'
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material'
import {
  useAuthStore,
  usePersistentNotificationStore,
  useUserStore,
  useDepartmentStore,
} from '@/stores'

interface Stats {
  totalUsers: number
  totalDepartments: number
  activeUsers: number
  unreadNotifications: number
}

const statConfig = [
  {
    key: 'totalUsers' as const,
    title: 'Total Users',
    icon: <PeopleIcon sx={{ fontSize: 32, color: 'white' }} />,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    key: 'totalDepartments' as const,
    title: 'Departments',
    icon: <BusinessIcon sx={{ fontSize: 32, color: 'white' }} />,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    key: 'activeUsers' as const,
    title: 'Active Users',
    icon: <CheckCircleIcon sx={{ fontSize: 32, color: 'white' }} />,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    key: 'unreadNotifications' as const,
    title: 'Unread Notifications',
    icon: <NotificationsIcon sx={{ fontSize: 32, color: 'white' }} />,
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
]

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const { unreadCount } = usePersistentNotificationStore()
  const { users, fetchUsers } = useUserStore()
  const { departments, fetchDepartments } = useDepartmentStore()

  const isAdmin = useMemo(() => user?.role === 'Admin', [user])

  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDepartments: 0,
    activeUsers: 0,
    unreadNotifications: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      if (isAdmin) {
        await Promise.all([fetchUsers(), fetchDepartments()])
      }
    }
    loadStats()
  }, [isAdmin, fetchUsers, fetchDepartments])

  useEffect(() => {
    setStats({
      totalUsers: users?.length || 0,
      totalDepartments: departments?.length || 0,
      activeUsers: users?.filter((u) => u.isActive).length || 0,
      unreadNotifications: unreadCount ?? 0,
    })
  }, [users, departments, unreadCount])

  return (
    <Box>
      <Grid container spacing={3}>
        {statConfig.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.key}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      background: stat.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats[stat.key]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
