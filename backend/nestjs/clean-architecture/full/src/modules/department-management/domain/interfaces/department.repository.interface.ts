import { Department } from '../entities/department.entity';

export interface DepartmentPaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface DepartmentPaginatedResult {
  data: Department[];
  totalItems: number;
}

export interface IDepartmentRepository {
  findById(id: number): Promise<Department | null>;
  findByCode(code: string): Promise<Department | null>;
  findAll(): Promise<Department[]>;
  findAllPaginated(options: DepartmentPaginationOptions): Promise<DepartmentPaginatedResult>;
  save(department: Department): Promise<Department>;
  delete(id: number): Promise<void>;
}

export const IDepartmentRepository = Symbol('IDepartmentRepository');
