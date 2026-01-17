import { useEffect } from 'react'
import { useThemeStore } from '@/stores'

interface AppThemeProviderProps {
  children: React.ReactNode
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const themeMode = useThemeStore((state) => state.themeMode)
  const applyTheme = useThemeStore((state) => state.applyTheme)

  // Apply theme on mount and when themeMode changes
  useEffect(() => {
    applyTheme()
  }, [themeMode, applyTheme])

  // Listen for system preference changes
  useEffect(() => {
    if (themeMode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      applyTheme()
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [themeMode, applyTheme])

  return <>{children}</>
}
