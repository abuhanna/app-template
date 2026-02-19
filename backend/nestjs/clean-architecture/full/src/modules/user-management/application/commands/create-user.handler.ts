import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateUserCommand } from './create-user.command';
import { UserDto } from '../dto/user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IDepartmentRepository } from '@/modules/department-management/domain/interfaces/department.repository.interface';
import { IPasswordService } from '@/modules/auth/domain/interfaces/password.service.interface';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IDepartmentRepository)
    private readonly departmentRepository: IDepartmentRepository,
    @Inject(IPasswordService)
    private readonly passwordService: IPasswordService,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserDto> {
    // Check email uniqueness
    const existingEmail = await this.userRepository.findByEmail(command.email);
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    // Check username uniqueness
    const existingUsername = await this.userRepository.findByUsername(command.username);
    if (existingUsername) {
      throw new ConflictException('Username already in use');
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

    // Hash password
    const passwordHash = await this.passwordService.hash(command.password);

    // Create user
    const user = User.create({
      email: command.email,
      username: command.username,
      passwordHash,
      firstName: command.firstName,
      lastName: command.lastName,
      role: command.role,
      departmentId: command.departmentId,
    });

    const savedUser = await this.userRepository.save(user);
    return UserMapper.toDto(savedUser, departmentName);
  }
}
