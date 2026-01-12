import { User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByPasswordResetToken(token: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  countByDepartmentId(departmentId: number): Promise<number>;
  save(user: User): Promise<User>;
  delete(id: number): Promise<void>;
}

export const IUserRepository = Symbol('IUserRepository');
