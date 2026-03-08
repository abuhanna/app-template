import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos/user.dto';
import { User } from '../entities/user.entity';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAllPaginated(
    page: number,
    pageSize: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    search?: string,
    isActive?: boolean,
    departmentId?: number,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const result = await this.userRepository.findAllPaginated(
      page,
      pageSize,
      sortBy,
      sortOrder,
      search,
      isActive,
      departmentId,
    );
    return {
      data: result.data.map((user) => this.mapToDto(user)),
      pagination: result.pagination,
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
      const dup = await this.userRepository.findByEmail(dto.email);
      if (dup) {
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
    // Soft delete: set isActive to false
    await this.userRepository.update(id, { isActive: false });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
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
      departmentName: user.departmentName || null,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
    };
  }
}
