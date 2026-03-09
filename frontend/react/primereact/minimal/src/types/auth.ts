export interface User {
  id: number
  username: string
  email: string
  firstName?: string
  lastName?: string
  fullName?: string
  role: string
  departmentId?: number
  departmentName?: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
  lastLoginAt?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    accessToken: string
    refreshToken: string
    expiresIn: number
    user?: User
  }
}

export interface RefreshTokenRequest {
  refreshToken: string
}
