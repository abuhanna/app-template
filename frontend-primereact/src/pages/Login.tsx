import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { useAuthStore } from '@/stores'
import '@/styles/auth.scss'

interface FormErrors {
  username: string
  password: string
}

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const token = useAuthStore((state) => state.token)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({ username: '', password: '' })

  useEffect(() => {
    if (token) {
      navigate('/dashboard')
    }
  }, [token, navigate])

  const validate = (): boolean => {
    const newErrors: FormErrors = { username: '', password: '' }
    let valid = true

    if (!username.trim()) {
      newErrors.username = 'Username is required'
      valid = false
    }

    if (!password) {
      newErrors.password = 'Password is required'
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

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
    <div className="auth-page">
      {/* Animated Background */}
      <div className="auth-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      {/* Login Card */}
      <div className="auth-card">
        <div className="card-content">
          {/* Logo & Header */}
          <div className="auth-header">
            <div className="logo-wrapper">
              <i className="pi pi-box"></i>
            </div>
            <h1>AppTemplate</h1>
            <p>Welcome back! Please sign in to continue.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <Message severity="error" text={error} className="mb-4 w-full" />
            )}

            <div className="field">
              <label htmlFor="username">
                <i className="pi pi-user"></i>
                Username
              </label>
              <InputText
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
                invalid={!!errors.username}
                size="large"
              />
              {errors.username && <small className="p-error">{errors.username}</small>}
            </div>

            <div className="field">
              <label htmlFor="password">
                <i className="pi pi-lock"></i>
                Password
              </label>
              <Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                feedback={false}
                toggleMask
                invalid={!!errors.password}
                inputClassName="w-full"
              />
              {errors.password && <small className="p-error">{errors.password}</small>}
            </div>

            <div className="form-options">
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              label="Sign In"
              icon="pi pi-sign-in"
              loading={loading}
              size="large"
              className="submit-button"
            />
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>Secure login powered by JWT authentication</p>
          </div>
        </div>
      </div>
    </div>
  )
}
