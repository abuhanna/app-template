import { useMemo, useEffect } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { useThemeStore } from '@/stores'
import { getTheme } from '@/theme'

interface AppThemeProviderProps {
  children: React.ReactNode
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const themeMode = useThemeStore((state) => state.themeMode)
  const isDark = useThemeStore((state) => state.isDark)

  const theme = useMemo(() => getTheme(isDark()), [themeMode])

  // Listen for system preference changes
  useEffect(() => {
    if (themeMode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      // Force re-render by touching state
      useThemeStore.setState({ themeMode: 'system' })
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [themeMode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
