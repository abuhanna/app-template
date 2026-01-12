import { Department } from '../entities/department.entity';

export interface IDepartmentRepository {
  findById(id: number): Promise<Department | null>;
  findByCode(code: string): Promise<Department | null>;
  findAll(): Promise<Department[]>;
  save(department: Department): Promise<Department>;
  delete(id: number): Promise<void>;
}

export const IDepartmentRepository = Symbol('IDepartmentRepository');
