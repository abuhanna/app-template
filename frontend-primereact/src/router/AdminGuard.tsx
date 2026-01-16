import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const user = useAuthStore((state) => state.user)

  if (user?.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
