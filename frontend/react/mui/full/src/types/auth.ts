import type { User } from './user'

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
