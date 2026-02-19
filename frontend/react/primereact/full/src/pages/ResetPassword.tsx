import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { authApi } from '@/services/authApi'
import '@/styles/auth.scss'

interface FormErrors {
  password: string
  confirmPassword: string
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({ password: '', confirmPassword: '' })

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token')
    }
  }, [token])

  const validate = (): boolean => {
    const newErrors: FormErrors = { password: '', confirmPassword: '' }
    let valid = true

    if (!password) {
      newErrors.password = 'Password is required'
      valid = false
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      valid = false
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
      valid = false
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    if (!token) {
      setError('Invalid or missing reset token')
      return
    }

    setLoading(true)
    setError('')

    try {
      await authApi.resetPassword({
        token,
        newPassword: password,
      })
      setSuccess(true)
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to reset password. The link may have expired.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page reset-password">
      <div className="auth-card">
        <div className="card-content">
          {/* Header */}
          <div className="auth-header">
            <div className="logo-wrapper purple">
              <i className="pi pi-lock"></i>
            </div>
            <h1>Reset Password</h1>
            <p>Enter your new password below.</p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <Message severity="error" text={error} className="mb-4 w-full" />
              )}

              <div className="field">
                <label htmlFor="password">New Password</label>
                <Password
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  disabled={loading}
                  toggleMask
                  invalid={!!errors.password}
                  inputClassName="w-full"
                />
                {errors.password && <small className="p-error">{errors.password}</small>}
              </div>

              <div className="field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <Password
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={loading}
                  feedback={false}
                  toggleMask
                  invalid={!!errors.confirmPassword}
                  inputClassName="w-full"
                />
                {errors.confirmPassword && (
                  <small className="p-error">{errors.confirmPassword}</small>
                )}
              </div>

              <Button
                type="submit"
                label="Reset Password"
                loading={loading}
                size="large"
                className="submit-button purple"
              />

              <div className="back-to-login">
                <Link to="/login" className="back-link purple">
                  <i className="pi pi-arrow-left"></i>
                  Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="success-state">
              <div className="success-icon">
                <i className="pi pi-check-circle"></i>
              </div>
              <h2>Password Reset Successful</h2>
              <p>
                Your password has been successfully reset. You can now login with your new password.
              </p>
              <Button
                label="Go to Login"
                onClick={() => navigate('/login')}
                size="large"
                className="w-full submit-button purple"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
