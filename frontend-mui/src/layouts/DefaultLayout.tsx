import { useState, useEffect } from 'react'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppNotification } from '@/components/AppNotification'
import { usePersistentNotificationStore } from '@/stores'

interface DefaultLayoutProps {
  children: React.ReactNode
}

const DRAWER_WIDTH = 260

export function DefaultLayout({ children }: DefaultLayoutProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const initConnection = usePersistentNotificationStore((state) => state.initConnection)
  const disconnect = usePersistentNotificationStore((state) => state.disconnect)

  useEffect(() => {
    initConnection()
    return () => {
      disconnect()
    }
  }, [initConnection, disconnect])

  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        width={DRAWER_WIDTH}
        isMobile={isMobile}
      />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: isMobile ? 0 : sidebarOpen ? `${DRAWER_WIDTH}px` : 0,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <AppHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            backgroundColor: 'grey.100',
          }}
        >
          {children}
        </Box>
      </Box>
      <AppNotification />
    </Box>
  )
}
