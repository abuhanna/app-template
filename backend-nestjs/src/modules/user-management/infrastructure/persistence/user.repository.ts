import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { UserRole } from '../../domain/value-objects/user-role';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
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

  async countByDepartmentId(departmentId: string): Promise<number> {
    return this.repository.count({ where: { departmentId } });
  }

  async save(user: User): Promise<User> {
    const entity = this.toEntity(user);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(entity: UserOrmEntity): User {
    return User.reconstitute(
      entity.id,
      entity.email,
      entity.username,
      entity.passwordHash,
      entity.firstName,
      entity.lastName,
      entity.role as UserRole,
      entity.departmentId,
      entity.isActive,
      entity.lastLoginAt,
      entity.passwordResetToken,
      entity.passwordResetTokenExpiresAt,
      entity.createdAt,
      entity.updatedAt,
      entity.createdBy,
      entity.updatedBy,
    );
  }

  private toEntity(user: User): UserOrmEntity {
    const entity = new UserOrmEntity();
    entity.id = user.id;
    entity.email = user.email;
    entity.username = user.username;
    entity.passwordHash = user.passwordHash;
    entity.firstName = user.firstName;
    entity.lastName = user.lastName;
    entity.role = user.role;
    entity.departmentId = user.departmentId;
    entity.isActive = user.isActive;
    entity.lastLoginAt = user.lastLoginAt;
    entity.passwordResetToken = user.passwordResetToken;
    entity.passwordResetTokenExpiresAt = user.passwordResetTokenExpiresAt;
    entity.createdAt = user.createdAt;
    entity.updatedAt = user.updatedAt;
    entity.createdBy = user.createdBy;
    entity.updatedBy = user.updatedBy;
    return entity;
  }
}
