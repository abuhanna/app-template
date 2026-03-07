import { User } from '../entities/user.entity';

export interface UserPaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
}

export interface UserPaginatedResult {
  items: User[];
  totalItems: number;
}

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByPasswordResetToken(token: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findAllPaginated(options: UserPaginationOptions): Promise<UserPaginatedResult>;
  countByDepartmentId(departmentId: number): Promise<number>;
  save(user: User): Promise<User>;
  delete(id: number): Promise<void>;
}

export const IUserRepository = Symbol('IUserRepository');
