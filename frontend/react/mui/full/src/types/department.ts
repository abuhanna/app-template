export interface Department {
  id: number
  code: string
  name: string
  description?: string
  isActive: boolean
  userCount: number
  createdAt: string
  updatedAt?: string
}

export interface CreateDepartmentRequest {
  name: string
  code: string
  description?: string
}

export interface UpdateDepartmentRequest {
  name?: string
  code?: string
  description?: string
  isActive?: boolean
}
