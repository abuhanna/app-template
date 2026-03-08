import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dtos/user.dto';
import { User } from './user.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(
    query: PaginationQueryDto,
    isActive?: string,
    departmentId?: string,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const repo = this.userRepository.getRepository();
    const qb = repo.createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department');

    if (query.search) {
      qb.andWhere(
        '(user.username ILIKE :search OR user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (isActive !== undefined && isActive !== '') {
      qb.andWhere('user.isActive = :isActive', { isActive: isActive === 'true' });
    }

    if (departmentId !== undefined && departmentId !== '') {
      qb.andWhere('user.departmentId = :departmentId', { departmentId: parseInt(departmentId) });
    }

    const validSortFields = ['id', 'username', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'];
    const sortField = query.sortBy && validSortFields.includes(query.sortBy) ? query.sortBy : 'createdAt';
    const direction = query.sortOrder === 'asc' ? 'ASC' : 'DESC';
    qb.orderBy(`user.${sortField}`, direction);

    const totalItems = await qb.getCount();
    qb.skip((page - 1) * pageSize).take(pageSize);
    const users = await qb.getMany();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: users.map(u => this.mapToDto(u)),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    return this.userRepository.findByEmailOrUsername(identifier);
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.mapToDto(user);
  }

  async findEntityById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    // Check for duplicate email
    const existingEmail = await this.userRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check for duplicate username
    const existingUsername = await this.userRepository.findByUsername(dto.username);
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
      firstName: dto.firstName ?? undefined,
      lastName: dto.lastName ?? undefined,
      role: dto.role || 'user',
      departmentId: dto.departmentId ?? undefined,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });
    return this.mapToDto(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (dto.email && dto.email !== existing.email) {
      const emailExists = await this.userRepository.findByEmail(dto.email);
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    const updateData: Partial<User> = {};
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.role !== undefined) updateData.role = dto.role;
    if (dto.departmentId !== undefined) updateData.departmentId = dto.departmentId;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const updated = await this.userRepository.update(id, updateData);
    return this.mapToDto(updated!);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.update(id, { isActive: false });
  }

  mapToDto(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      fullName: user.fullName,
      role: user.role,
      departmentId: user.departmentId || null,
      departmentName: user.departmentName,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
    };
  }
}
