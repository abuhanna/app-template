import { useMemo } from 'react'
import { ProgressBar } from 'primereact/progressbar'

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const checks = useMemo(() => {
    const p = password || ''
    return {
      length: p.length >= 8,
      uppercase: /[A-Z]/.test(p),
      lowercase: /[a-z]/.test(p),
      number: /[0-9]/.test(p),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(p),
    }
  }, [password])

  const passedChecks = useMemo(() => {
    return Object.values(checks).filter(Boolean).length
  }, [checks])

  const strength = useMemo(() => {
    return (passedChecks / 5) * 100
  }, [passedChecks])

  const strengthColor = useMemo(() => {
    if (passedChecks <= 2) return 'var(--red-500)'
    if (passedChecks <= 3) return 'var(--orange-500)'
    if (passedChecks <= 4) return 'var(--blue-500)'
    return 'var(--green-500)'
  }, [passedChecks])

  const textColorClass = useMemo(() => {
    if (passedChecks <= 2) return 'text-red-500'
    if (passedChecks <= 3) return 'text-orange-500'
    if (passedChecks <= 4) return 'text-blue-500'
    return 'text-green-500'
  }, [passedChecks])

  const strengthLabel = useMemo(() => {
    if (passedChecks <= 2) return 'Weak'
    if (passedChecks <= 3) return 'Fair'
    if (passedChecks <= 4) return 'Good'
    return 'Strong'
  }, [passedChecks])

  const requirements = useMemo(() => {
    const missing: string[] = []
    if (!checks.length) missing.push('8+ chars')
    if (!checks.uppercase) missing.push('uppercase')
    if (!checks.lowercase) missing.push('lowercase')
    if (!checks.number) missing.push('number')
    if (!checks.special) missing.push('special char')

    if (missing.length === 0) return 'All requirements met'
    return `Missing: ${missing.join(', ')}`
  }, [checks])

  return (
    <div className="mt-1">
      <ProgressBar
        value={strength}
        showValue={false}
        style={{ height: '8px' }}
        color={strengthColor}
      />
      <div className="flex justify-content-between mt-1">
        <span className={`text-sm ${textColorClass}`}>{strengthLabel}</span>
        <span className="text-sm text-500">{requirements}</span>
      </div>
    </div>
  )
}
