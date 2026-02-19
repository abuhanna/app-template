import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { setLocale as setI18nLocale } from '@/i18n'

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref(localStorage.getItem('locale') || 'en')

  const isRTL = computed(() => locale.value === 'ar')

  const availableLocales = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ]

  function setLocale(newLocale) {
    locale.value = newLocale
    setI18nLocale(newLocale)
  }

  return {
    locale,
    isRTL,
    availableLocales,
    setLocale,
  }
})
