import type { User } from './user'

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
