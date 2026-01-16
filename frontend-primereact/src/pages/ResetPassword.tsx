import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Message } from 'primereact/message'
import { authApi } from '@/services/authApi'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      await authApi.resetPassword(token, password)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen surface-ground">
        <Card className="w-full max-w-30rem p-4">
          <div className="text-center">
            <div
              className="flex align-items-center justify-content-center border-round mx-auto mb-4"
              style={{ width: '4rem', height: '4rem', backgroundColor: 'var(--red-100)' }}
            >
              <i className="pi pi-times text-red-500 text-4xl" />
            </div>
            <div className="text-900 text-2xl font-medium mb-3">Invalid Link</div>
            <p className="text-600 mb-4">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link to="/forgot-password" className="no-underline">
              <Button label="Request New Link" icon="pi pi-refresh" className="w-full" />
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen surface-ground">
        <Card className="w-full max-w-30rem p-4">
          <div className="text-center">
            <div
              className="flex align-items-center justify-content-center border-round mx-auto mb-4"
              style={{ width: '4rem', height: '4rem', backgroundColor: 'var(--green-100)' }}
            >
              <i className="pi pi-check text-green-500 text-4xl" />
            </div>
            <div className="text-900 text-2xl font-medium mb-3">Password Reset Successful</div>
            <p className="text-600 mb-4">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <Button
              label="Go to Login"
              icon="pi pi-sign-in"
              className="w-full"
              onClick={() => navigate('/login')}
            />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-ground">
      <Card className="w-full max-w-30rem p-4">
        <div className="text-center mb-5">
          <div className="text-900 text-3xl font-medium mb-3">Reset Password</div>
          <span className="text-600 font-medium">Enter your new password below.</span>
        </div>

        {error && <Message severity="error" text={error} className="w-full mb-4" />}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-900 font-medium mb-2">
              New Password
            </label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full"
              inputClassName="w-full"
              toggleMask
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-900 font-medium mb-2">
              Confirm Password
            </label>
            <Password
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full"
              inputClassName="w-full"
              toggleMask
              feedback={false}
              required
            />
          </div>

          <Button
            type="submit"
            label="Reset Password"
            icon="pi pi-lock"
            className="w-full mb-3"
            loading={loading}
          />

          <div className="text-center">
            <Link to="/login" className="text-primary no-underline">
              Back to Login
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
