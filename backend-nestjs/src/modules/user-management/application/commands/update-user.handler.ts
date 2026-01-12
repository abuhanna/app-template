import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateUserCommand } from './update-user.command';
import { UserDto } from '../dto/user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IDepartmentRepository } from '@/modules/department-management/domain/interfaces/department.repository.interface';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IDepartmentRepository)
    private readonly departmentRepository: IDepartmentRepository,
  ) {}

  async execute(command: UpdateUserCommand): Promise<UserDto> {
    const user = await this.userRepository.findById(command.id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check email uniqueness if updating
    if (command.email && command.email !== user.email) {
      const existingEmail = await this.userRepository.findByEmail(command.email);
      if (existingEmail) {
        throw new ConflictException('Email already in use');
      }
    }

    // Check username uniqueness if updating
    if (command.username && command.username !== user.username) {
      const existingUsername = await this.userRepository.findByUsername(command.username);
      if (existingUsername) {
        throw new ConflictException('Username already in use');
      }
    }

    // Validate department exists if provided
    let departmentName: string | null = null;
    if (command.departmentId) {
      const department = await this.departmentRepository.findById(command.departmentId);
      if (!department) {
        throw new BadRequestException('Department not found');
      }
      departmentName = department.name;
    }

    // Update user
    user.update({
      email: command.email,
      username: command.username,
      firstName: command.firstName,
      lastName: command.lastName,
      role: command.role,
      departmentId: command.departmentId,
      isActive: command.isActive,
    });

    const savedUser = await this.userRepository.save(user);
    return UserMapper.toDto(savedUser, departmentName);
  }
}
