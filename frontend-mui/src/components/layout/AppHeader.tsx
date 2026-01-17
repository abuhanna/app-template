import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material'
import { useAuthStore, useThemeStore, ThemeMode } from '@/stores'
import { NotificationMenu } from '@/components/common/NotificationMenu'
import { ConfirmDialog } from '@/components'

interface AppHeaderProps {
  onToggleSidebar: () => void
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/profile': 'Profile',
  '/users': 'Users',
  '/departments': 'Departments',
  '/notifications': 'Notifications',
}

export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const themeMode = useThemeStore((state) => state.themeMode)
  const setTheme = useThemeStore((state) => state.setTheme)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [themeAnchorEl, setThemeAnchorEl] = useState<null | HTMLElement>(null)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const themeOptions: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'light', label: 'Light', icon: <LightModeIcon fontSize="small" /> },
    { mode: 'dark', label: 'Dark', icon: <DarkModeIcon fontSize="small" /> },
    { mode: 'system', label: 'System', icon: <ComputerIcon fontSize="small" /> },
  ]

  const getCurrentThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return <LightModeIcon />
      case 'dark':
        return <DarkModeIcon />
      default:
        return <ComputerIcon />
    }
  }

  const handleThemeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setThemeAnchorEl(event.currentTarget)
  }

  const handleThemeMenuClose = () => {
    setThemeAnchorEl(null)
  }

  const handleThemeChange = (mode: ThemeMode) => {
    setTheme(mode)
    handleThemeMenuClose()
  }

  const pageTitle = pageTitles[location.pathname] || 'AppTemplate'

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleProfile = () => {
    handleMenuClose()
    navigate('/profile')
  }

  const handleLogoutClick = () => {
    handleMenuClose()
    setLogoutDialogOpen(true)
  }

  const handleLogoutConfirm = async () => {
    setLogoutDialogOpen(false)
    await logout()
    navigate('/login')
  }

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false)
  }

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    return user?.username?.[0]?.toUpperCase() || 'U'
  }

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={1}
      sx={{ backgroundColor: 'background.paper' }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onToggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {pageTitle}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          <IconButton onClick={handleThemeMenuOpen} size="small">
            {getCurrentThemeIcon()}
          </IconButton>
          <Menu
            anchorEl={themeAnchorEl}
            open={Boolean(themeAnchorEl)}
            onClose={handleThemeMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {themeOptions.map((option) => (
              <MenuItem
                key={option.mode}
                onClick={() => handleThemeChange(option.mode)}
                selected={themeMode === option.mode}
              >
                <ListItemIcon>{option.icon}</ListItemIcon>
                {option.label}
              </MenuItem>
            ))}
          </Menu>

          <NotificationMenu />

          <IconButton onClick={handleMenuOpen} size="small">
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
              {getInitials()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogoutClick}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      <ConfirmDialog
        open={logoutDialogOpen}
        title="Sign Out"
        message={`Are you sure you want to sign out?\n\nYou will be redirected to the login page.`}
        confirmText="Sign Out"
        cancelText="Stay Logged In"
        confirmColor="warning"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </AppBar>
  )
}
