import { User } from '../../domain/entities/user.entity';
import { UserDto } from '../dto/user.dto';

export class UserMapper {
  static toDto(user: User, departmentName?: string | null): UserDto {
    return new UserDto({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      departmentId: user.departmentId,
      departmentName: departmentName ?? null,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  static toDtoList(users: User[]): UserDto[] {
    return users.map((user) => UserMapper.toDto(user));
  }
}
