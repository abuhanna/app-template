import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setLocale as setI18nLocale } from '@/i18n'

interface LocaleState {
  locale: string
  isRTL: boolean
  availableLocales: Array<{ code: string; name: string; flag: string }>
  setLocale: (locale: string) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: localStorage.getItem('locale') || 'en',
      isRTL: (localStorage.getItem('locale') || 'en') === 'ar',
      availableLocales: [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
      ],
      setLocale: (locale: string) => {
        setI18nLocale(locale)
        set({ locale, isRTL: locale === 'ar' })
      },
    }),
    {
      name: 'locale-storage',
    }
  )
)
