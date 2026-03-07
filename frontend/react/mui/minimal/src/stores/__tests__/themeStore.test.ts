import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useThemeStore } from '../themeStore'

describe('ThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ themeMode: 'light' })
    vi.clearAllMocks()
  })

  describe('setTheme', () => {
    it('changes themeMode', () => {
      useThemeStore.getState().setTheme('dark')
      expect(useThemeStore.getState().themeMode).toBe('dark')

      useThemeStore.getState().setTheme('system')
      expect(useThemeStore.getState().themeMode).toBe('system')
    })
  })

  describe('toggleTheme', () => {
    it('switches from light to dark', () => {
      useThemeStore.setState({ themeMode: 'light' })
      useThemeStore.getState().toggleTheme()
      expect(useThemeStore.getState().themeMode).toBe('dark')
    })

    it('switches from dark to light', () => {
      useThemeStore.setState({ themeMode: 'dark' })
      useThemeStore.getState().toggleTheme()
      expect(useThemeStore.getState().themeMode).toBe('light')
    })
  })

  describe('isDark', () => {
    it('returns true when mode is dark', () => {
      useThemeStore.setState({ themeMode: 'dark' })
      expect(useThemeStore.getState().isDark()).toBe(true)
    })

    it('returns false when mode is light', () => {
      useThemeStore.setState({ themeMode: 'light' })
      expect(useThemeStore.getState().isDark()).toBe(false)
    })
  })
})
