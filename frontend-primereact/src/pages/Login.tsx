import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Message } from 'primereact/message'
import { useAuthStore } from '@/stores/authStore'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login({ username, password })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-ground">
      <Card className="w-full max-w-30rem p-4">
        <div className="text-center mb-5">
          <div className="text-900 text-3xl font-medium mb-3">Welcome Back</div>
          <span className="text-600 font-medium">Sign in to continue</span>
        </div>

        {error && (
          <Message severity="error" text={error} className="w-full mb-4" />
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-900 font-medium mb-2">
              Username
            </label>
            <InputText
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-900 font-medium mb-2">
              Password
            </label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full"
              inputClassName="w-full"
              toggleMask
              feedback={false}
              required
            />
          </div>

          <div className="flex align-items-center justify-content-between mb-4">
            <Link to="/forgot-password" className="text-primary no-underline">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            label="Sign In"
            icon="pi pi-sign-in"
            className="w-full"
            loading={loading}
          />
        </form>
      </Card>
    </div>
  )
}
