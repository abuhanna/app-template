import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateProfileCommand } from './update-profile.command';
import { UserInfoDto } from '../dto/user-info.dto';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UpdateProfileCommand): Promise<UserInfoDto> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.update({
      firstName: command.firstName,
      lastName: command.lastName,
    });

    const savedUser = await this.userRepository.save(user);

    return new UserInfoDto({
      id: savedUser.id,
      email: savedUser.email,
      username: savedUser.username,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      fullName: savedUser.fullName,
      role: savedUser.role,
      departmentId: savedUser.departmentId,
      departmentName: null,
    });
  }
}
