import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { User } from '../../domain/entities/user.entity';
import {
  IUserRepository,
  UserPaginationOptions,
  UserPaginatedResult,
} from '../../domain/interfaces/user.repository.interface';
import { UserRole } from '../../domain/value-objects/user-role';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async findById(id: number): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { username } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { passwordResetToken: token },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repository.find({ order: { createdAt: 'DESC' } });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findAllPaginated(options: UserPaginationOptions): Promise<UserPaginatedResult> {
    const { page, pageSize, sortBy, sortDir = 'asc', search } = options;

    const queryBuilder = this.repository.createQueryBuilder('user');

    // Apply search filter
    if (search) {
      queryBuilder.where(
        '(user.email ILIKE :search OR user.username ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    const validSortFields = ['id', 'email', 'username', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'updatedAt'];
    const sortFieldMap: Record<string, string> = {
      id: 'user.id',
      email: 'user.email',
      username: 'user.username',
      firstName: 'user.first_name',
      lastName: 'user.last_name',
      role: 'user.role',
      isActive: 'user.is_active',
      createdAt: 'user.created_at',
      updatedAt: 'user.updated_at',
    };

    if (sortBy && validSortFields.includes(sortBy)) {
      queryBuilder.orderBy(sortFieldMap[sortBy], sortDir.toUpperCase() as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('user.created_at', 'DESC');
    }

    // Get total count
    const totalItems = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    const entities = await queryBuilder.getMany();

    return {
      items: entities.map((entity) => this.toDomain(entity)),
      totalItems,
    };
  }

  async countByDepartmentId(departmentId: number): Promise<number> {
    return this.repository.count({ where: { departmentId: departmentId.toString() } });
  }

  async save(user: User): Promise<User> {
    const entity = this.toEntity(user);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id.toString());
  }

  private toDomain(entity: UserOrmEntity): User {
    return User.reconstitute(
      parseInt(entity.id, 10),
      entity.email,
      entity.username,
      entity.passwordHash,
      entity.firstName,
      entity.lastName,
      entity.role as UserRole,
      entity.departmentId ? parseInt(entity.departmentId, 10) : null,
      entity.isActive,
      entity.lastLoginAt,
      entity.passwordResetToken,
      entity.passwordResetTokenExpiresAt,
      entity.passwordHistory || [],
      entity.createdAt,
      entity.updatedAt,
      entity.createdBy ? parseInt(entity.createdBy, 10) : null,
      entity.updatedBy ? parseInt(entity.updatedBy, 10) : null,
    );
  }

  private toEntity(user: User): UserOrmEntity {
    const entity = new UserOrmEntity();
    if (user.id !== 0) {
      entity.id = user.id.toString();
    }
    entity.email = user.email;
    entity.username = user.username;
    entity.passwordHash = user.passwordHash;
    entity.firstName = user.firstName;
    entity.lastName = user.lastName;
    entity.role = user.role;
    entity.departmentId = user.departmentId ? user.departmentId.toString() : null;
    entity.isActive = user.isActive;
    entity.lastLoginAt = user.lastLoginAt;
    entity.passwordResetToken = user.passwordResetToken;
    entity.passwordResetTokenExpiresAt = user.passwordResetTokenExpiresAt;
    entity.passwordHistory = user.passwordHistory;
    entity.createdAt = user.createdAt;
    entity.updatedAt = user.updatedAt;
    entity.createdBy = user.createdBy ? user.createdBy.toString() : null;
    entity.updatedBy = user.updatedBy ? user.updatedBy.toString() : null;
    return entity;
  }
}
