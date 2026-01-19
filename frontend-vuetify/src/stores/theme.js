import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useTheme } from 'vuetify'

export const useThemeStore = defineStore('theme', () => {
  const vuetifyTheme = useTheme()

  // Theme mode: 'light', 'dark', or 'system'
  const themeMode = ref(localStorage.getItem('themeMode') || 'system')

  // Compute effective theme based on mode and system preference
  const isDark = computed(() => {
    if (themeMode.value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return themeMode.value === 'dark'
  })

  // Apply theme to Vuetify
  const applyTheme = () => {
    const mode = isDark.value ? 'dark' : 'light'
    /*
      [Vuetify UPGRADE] 'theme.global.name.value = ...' is deprecated.
      The warning suggests using 'theme.change(...)'.
      We try to use the new API if available, falling back to the old one.
    */
    if (vuetifyTheme.change) {
      vuetifyTheme.change(mode)
    } else if (vuetifyTheme.global && vuetifyTheme.global.name) {
      vuetifyTheme.global.name.value = mode
    }
  }

  // Set theme mode
  const setTheme = (mode) => {
    themeMode.value = mode
    localStorage.setItem('themeMode', mode)
    applyTheme()
  }

  // Toggle between light and dark (skipping system)
  const toggleTheme = () => {
    const newMode = isDark.value ? 'light' : 'dark'
    setTheme(newMode)
  }

  // Watch for system preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    if (themeMode.value === 'system') {
      applyTheme()
    }
  })

  // Initialize theme on store creation
  applyTheme()

  return {
    themeMode,
    isDark,
    setTheme,
    toggleTheme,
  }
})
