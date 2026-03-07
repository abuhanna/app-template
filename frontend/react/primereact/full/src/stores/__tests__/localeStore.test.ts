import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/i18n', () => ({
  setLocale: vi.fn(),
}))

import { useLocaleStore } from '../localeStore'

describe('LocaleStore', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'en', isRTL: false })
    vi.clearAllMocks()
  })

  describe('setLocale', () => {
    it('changes locale', () => {
      useLocaleStore.getState().setLocale('ar')

      const state = useLocaleStore.getState()
      expect(state.locale).toBe('ar')
    })
  })

  describe('isRTL', () => {
    it('returns true for ar', () => {
      useLocaleStore.getState().setLocale('ar')
      expect(useLocaleStore.getState().isRTL).toBe(true)
    })

    it('returns false for en', () => {
      useLocaleStore.getState().setLocale('en')
      expect(useLocaleStore.getState().isRTL).toBe(false)
    })
  })
})
