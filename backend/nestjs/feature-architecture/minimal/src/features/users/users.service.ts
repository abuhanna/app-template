import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserResponseDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOneBy({ username });
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ email: identifier }, { username: identifier }],
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async createFromExternal(data: {
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    departmentId?: number;
  }): Promise<User> {
    let user = await this.findByEmail(data.email);
    if (user) {
      // Update existing user
      if (data.firstName !== undefined) user.firstName = data.firstName;
      if (data.lastName !== undefined) user.lastName = data.lastName;
      if (data.role !== undefined) user.role = data.role;
      if (data.departmentId !== undefined) user.departmentId = data.departmentId;
      return this.userRepository.save(user);
    }

    // Create new user
    const newUser = this.userRepository.create({
      username: data.username,
      email: data.email,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      role: data.role || 'user',
      departmentId: data.departmentId || null,
      isActive: true,
    });
    return this.userRepository.save(newUser);
  }

  async updateProfile(id: number, data: { firstName?: string; lastName?: string }): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    return this.userRepository.save(user);
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
      departmentName: null,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
    };
  }
}
