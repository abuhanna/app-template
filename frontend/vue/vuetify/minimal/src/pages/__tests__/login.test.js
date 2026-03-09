import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createVuetify } from 'vuetify'
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
  const vuetify = createVuetify()

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  function mountLogin () {
    return shallowMount(LoginPage, {
      global: {
        plugins: [vuetify, createPinia()],
        stubs: {
          RouterLink: true,
        },
      },
    })
  }

  it('renders the login component', () => {
    const wrapper = mountLogin()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders login form structure', () => {
    const wrapper = mountLogin()
    const html = wrapper.html()
    // Vuetify components are shallow-stubbed, so check for stub presence
    expect(html).toContain('v-form')
  })

  it('includes text field components', () => {
    const wrapper = mountLogin()
    const html = wrapper.html()
    // shallowMount renders Vuetify components as stubs
    expect(html).toContain('v-text-field')
  })
})
