import { describe, it, expect, beforeEach, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'
import LoginPage from '../login.vue'

// Provide definePage as a global stub (compile-time macro from unplugin-vue-router)
vi.stubGlobal('definePage', vi.fn())

vi.mock('@/services/authApi', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
}))

vi.mock('@/router', () => ({
  default: {
    push: vi.fn(),
    currentRoute: { value: { fullPath: '/login' } },
  },
}))

describe('Login Page', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  function mountLogin() {
    return shallowMount(LoginPage, {
      global: {
        plugins: [createPinia(), PrimeVue],
        stubs: {
          RouterLink: true,
          InputText: true,
          Password: true,
          Button: true,
          Message: true,
          Checkbox: true,
        },
      },
    })
  }

  it('renders the login component', () => {
    const wrapper = mountLogin()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders login form', () => {
    const wrapper = mountLogin()
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('renders heading text', () => {
    const wrapper = mountLogin()
    expect(wrapper.text()).toContain('AppTemplate')
  })
})
