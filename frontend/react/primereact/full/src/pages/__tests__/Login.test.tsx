import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Login from '../Login'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: null }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}))

vi.mock('@/stores', () => ({
  useAuthStore: (selector: (state: any) => any) => {
    const state = {
      login: vi.fn(),
      loading: false,
      token: null,
    }
    return selector(state)
  },
}))

vi.mock('@/styles/auth.scss', () => ({}))

describe('Login Page', () => {
  it('renders login form', () => {
    render(<Login />)
    const form = document.querySelector('form')
    expect(form).toBeInTheDocument()
  })

  it('renders sign in button', () => {
    render(<Login />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })
})
