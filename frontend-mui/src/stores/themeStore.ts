import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  themeMode: ThemeMode
  setTheme: (mode: ThemeMode) => void
  toggleTheme: () => void
  isDark: () => boolean
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: 'system',

      setTheme: (mode: ThemeMode) => {
        set({ themeMode: mode })
      },

      toggleTheme: () => {
        const isDark = get().isDark()
        set({ themeMode: isDark ? 'light' : 'dark' })
      },

      isDark: () => {
        const mode = get().themeMode
        if (mode === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        return mode === 'dark'
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ themeMode: state.themeMode }),
    }
  )
)
