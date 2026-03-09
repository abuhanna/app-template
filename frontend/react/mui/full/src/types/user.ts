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
  lastLoginAt?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
  role: string
  departmentId?: number
  isActive?: boolean
}

export interface UpdateUserRequest {
  email?: string
  firstName?: string
  lastName?: string
  role?: string
  departmentId?: number
  isActive?: boolean
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
