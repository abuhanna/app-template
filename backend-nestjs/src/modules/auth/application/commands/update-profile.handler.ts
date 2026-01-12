import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateProfileCommand } from './update-profile.command';
import { UserInfoDto } from '../dto/user-info.dto';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';
import { IDepartmentRepository } from '@/modules/department-management/domain/interfaces/department.repository.interface';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IDepartmentRepository)
    private readonly departmentRepository: IDepartmentRepository,
  ) {}

  async execute(command: UpdateProfileCommand): Promise<UserInfoDto> {
    const user = await this.userRepository.findById(command.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check email uniqueness if updating
    if (command.email && command.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(command.email);
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    // Update user
    user.update({
      firstName: command.firstName,
      lastName: command.lastName,
      email: command.email,
    });

    const savedUser = await this.userRepository.save(user);

    // Get department name if exists
    let departmentName: string | null = null;
    if (savedUser.departmentId) {
      const department = await this.departmentRepository.findById(savedUser.departmentId);
      departmentName = department?.name ?? null;
    }

    return new UserInfoDto({
      id: savedUser.id,
      email: savedUser.email,
      username: savedUser.username,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      fullName: savedUser.fullName,
      role: savedUser.role,
      departmentId: savedUser.departmentId,
      departmentName,
    });
  }
}
