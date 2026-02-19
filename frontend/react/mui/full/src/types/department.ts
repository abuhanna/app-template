export interface Department {
  id: string
  name: string
  code: string
  description?: string
  isActive: boolean
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

export interface DepartmentListResponse {
  data: Department[]
  total: number
  page: number
  pageSize: number
}
