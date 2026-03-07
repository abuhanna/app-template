import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock window.matchMedia before any store import
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

import { useThemeStore } from '../theme'

describe('Theme Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('toggleTheme switches between light and dark', () => {
    const store = useThemeStore()
    // Default themeMode is 'system'; isDark depends on matchMedia (mocked to false)
    store.setTheme('light')
    expect(store.isDark).toBe(false)

    store.toggleTheme()
    expect(store.themeMode).toBe('dark')
    expect(store.isDark).toBe(true)

    store.toggleTheme()
    expect(store.themeMode).toBe('light')
    expect(store.isDark).toBe(false)
  })

  it('setTheme sets specific mode', () => {
    const store = useThemeStore()

    store.setTheme('dark')
    expect(store.themeMode).toBe('dark')
    expect(localStorage.getItem('themeMode')).toBe('dark')

    store.setTheme('light')
    expect(store.themeMode).toBe('light')
    expect(localStorage.getItem('themeMode')).toBe('light')
  })

  it('isDark is computed from themeMode', () => {
    const store = useThemeStore()

    store.setTheme('dark')
    expect(store.isDark).toBe(true)

    store.setTheme('light')
    expect(store.isDark).toBe(false)
  })

  it('reads initial value from localStorage', () => {
    localStorage.setItem('themeMode', 'dark')

    const store = useThemeStore()
    expect(store.themeMode).toBe('dark')
    expect(store.isDark).toBe(true)
  })
})
