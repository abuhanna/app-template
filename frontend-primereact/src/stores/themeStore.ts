import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  themeMode: ThemeMode
  setTheme: (mode: ThemeMode) => void
  toggleTheme: () => void
  isDark: () => boolean
  applyTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: 'system',

      setTheme: (mode: ThemeMode) => {
        set({ themeMode: mode })
        get().applyTheme()
      },

      toggleTheme: () => {
        const isDark = get().isDark()
        get().setTheme(isDark ? 'light' : 'dark')
      },

      isDark: () => {
        const mode = get().themeMode
        if (mode === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        return mode === 'dark'
      },

      applyTheme: () => {
        const isDark = get().isDark()
        if (isDark) {
          document.documentElement.classList.add('app-dark')
        } else {
          document.documentElement.classList.remove('app-dark')
        }
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ themeMode: state.themeMode }),
    }
  )
)
