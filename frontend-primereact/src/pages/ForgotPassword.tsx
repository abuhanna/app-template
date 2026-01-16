import { useState } from 'react'
import { Link } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Message } from 'primereact/message'
import { authApi } from '@/services/authApi'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authApi.forgotPassword(email)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
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
            <div className="text-900 text-2xl font-medium mb-3">Check Your Email</div>
            <p className="text-600 mb-4">
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox
              and follow the instructions to reset your password.
            </p>
            <Link to="/login" className="no-underline">
              <Button label="Back to Login" icon="pi pi-arrow-left" className="w-full" />
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-ground">
      <Card className="w-full max-w-30rem p-4">
        <div className="text-center mb-5">
          <div className="text-900 text-3xl font-medium mb-3">Forgot Password</div>
          <span className="text-600 font-medium">
            Enter your email address and we'll send you a link to reset your password.
          </span>
        </div>

        {error && <Message severity="error" text={error} className="w-full mb-4" />}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-900 font-medium mb-2">
              Email Address
            </label>
            <InputText
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full"
              required
            />
          </div>

          <Button
            type="submit"
            label="Send Reset Link"
            icon="pi pi-send"
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
