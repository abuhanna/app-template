import { Department } from '../entities/department.entity';

export interface IDepartmentRepository {
  findById(id: string): Promise<Department | null>;
  findByCode(code: string): Promise<Department | null>;
  findAll(): Promise<Department[]>;
  save(department: Department): Promise<Department>;
  delete(id: string): Promise<void>;
}

export const IDepartmentRepository = Symbol('IDepartmentRepository');
