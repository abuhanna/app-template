import { useMemo } from 'react'
import { Box, LinearProgress, Typography } from '@mui/material'

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
    if (passedChecks <= 2) return 'error'
    if (passedChecks <= 3) return 'warning'
    if (passedChecks <= 4) return 'info'
    return 'success'
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
    <Box sx={{ mt: 0.5 }}>
      <LinearProgress
        variant="determinate"
        value={strength}
        color={strengthColor}
        sx={{ height: 8, borderRadius: 1 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption" color={`${strengthColor}.main`}>
          {strengthLabel}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {requirements}
        </Typography>
      </Box>
    </Box>
  )
}
