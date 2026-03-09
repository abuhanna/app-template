import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useLocaleStore } from '../locale'

vi.mock('@/i18n', () => ({
  setLocale: vi.fn(),
}))

describe('Locale Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('setLocale changes locale value', () => {
    const store = useLocaleStore()
    expect(store.locale).toBe('en')

    store.setLocale('ar')
    expect(store.locale).toBe('ar')
  })

  it('isRTL returns true for ar', () => {
    const store = useLocaleStore()
    store.setLocale('ar')
    expect(store.isRTL).toBe(true)
  })

  it('isRTL returns false for en', () => {
    const store = useLocaleStore()
    store.setLocale('en')
    expect(store.isRTL).toBe(false)
  })

  it('availableLocales includes en and ar', () => {
    const store = useLocaleStore()
    const codes = store.availableLocales.map(l => l.code)
    expect(codes).toContain('en')
    expect(codes).toContain('ar')
  })
})
