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

// Mock MUI icons to avoid EMFILE error from loading thousands of icon files
vi.mock('@mui/icons-material', () => ({
  Visibility: () => <span data-testid="visibility-icon" />,
  VisibilityOff: () => <span data-testid="visibility-off-icon" />,
  Person: () => <span data-testid="person-icon" />,
  Lock: () => <span data-testid="lock-icon" />,
}))

describe('Login Page', () => {
  it('renders login form with username and password fields', () => {
    render(<Login />)
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders sign in button', () => {
    render(<Login />)
    const button = screen.getByRole('button', { name: /sign in/i })
    expect(button).toBeInTheDocument()
  })
})
