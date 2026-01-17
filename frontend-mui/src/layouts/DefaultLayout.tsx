import { useState, useEffect } from 'react'
import { Box, useMediaQuery, styled, useTheme } from '@mui/material'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { AppNotification } from '@/components/AppNotification'
import { usePersistentNotificationStore } from '@/stores'

interface DefaultLayoutProps {
  children: React.ReactNode
}

const DRAWER_WIDTH = 260

const ContentWrapper = styled('div', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean
}>(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${DRAWER_WIDTH}px`,
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      },
    },
  ],
}))

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
      <ContentWrapper open={isMobile ? true : sidebarOpen}>
        <AppHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: 'grey.100',
          }}
        >
          <Breadcrumbs />
          {children}
        </Box>
      </ContentWrapper>
      <AppNotification />
    </Box>
  )
}
