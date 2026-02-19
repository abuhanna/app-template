import { Repository } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository, UserPaginationOptions, UserPaginatedResult } from '../../domain/interfaces/user.repository.interface';
export declare class UserRepository implements IUserRepository {
    private readonly repository;
    constructor(repository: Repository<UserOrmEntity>);
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    findByPasswordResetToken(token: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    findAllPaginated(options: UserPaginationOptions): Promise<UserPaginatedResult>;
    countByDepartmentId(departmentId: number): Promise<number>;
    save(user: User): Promise<User>;
    delete(id: number): Promise<void>;
    private toDomain;
    private toEntity;
}
