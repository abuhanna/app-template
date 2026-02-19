export interface User {
  id: string
  username: string
  email: string
  name?: string
  role: string
  departmentId?: string
  departmentName?: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  name?: string
  role: string
  departmentId?: string
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  name?: string
  role?: string
  departmentId?: string
  isActive?: boolean
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UserListResponse {
  data: User[]
  total: number
  page: number
  pageSize: number
}
