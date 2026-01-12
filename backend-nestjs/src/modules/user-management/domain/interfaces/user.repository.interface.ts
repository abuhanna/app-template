import { User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByPasswordResetToken(token: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  countByDepartmentId(departmentId: string): Promise<number>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

export const IUserRepository = Symbol('IUserRepository');
