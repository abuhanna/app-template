export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  departmentId?: string
  departmentName?: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  refreshTokenExpiresAt: string
  user: User
}

export interface RefreshTokenRequest {
  refreshToken: string
}
