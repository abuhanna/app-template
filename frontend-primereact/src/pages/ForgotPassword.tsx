import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { authApi } from '@/services/authApi'
import '@/styles/auth.scss'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const validate = (): boolean => {
    setEmailError('')

    if (!email.trim()) {
      setEmailError('Email is required')
      return false
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Invalid email format')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError('')

    try {
      await authApi.forgotPassword(email)
      setSubmitted(true)
    } catch {
      // Don't reveal if email exists or not
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page forgot-password">
      <div className="auth-card">
        <div className="card-content">
          {/* Header */}
          <div className="auth-header">
            <div className="logo-wrapper purple">
              <i className="pi pi-lock"></i>
            </div>
            <h1>Forgot Password</h1>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <Message severity="error" text={error} className="mb-4 w-full" />
              )}

              <div className="field">
                <label htmlFor="email">Email Address</label>
                <InputText
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={loading}
                  invalid={!!emailError}
                  size="large"
                />
                {emailError && <small className="p-error">{emailError}</small>}
              </div>

              <Button
                type="submit"
                label="Send Reset Link"
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
              <h2>Check Your Email</h2>
              <p>
                If an account exists for <strong>{email}</strong>, you will receive a password
                reset link shortly.
              </p>
              <Button
                label="Back to Login"
                severity="secondary"
                size="large"
                onClick={() => navigate('/login')}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
