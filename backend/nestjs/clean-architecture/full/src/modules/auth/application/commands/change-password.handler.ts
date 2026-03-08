import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ChangePasswordCommand } from './change-password.command';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';
import { IPasswordService } from '../../domain/interfaces/password.service.interface';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IPasswordService)
    private readonly passwordService: IPasswordService,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.passwordService.verify(
      command.currentPassword,
      user.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await this.passwordService.hash(command.newPassword);

    // Update password
    user.updatePassword(newPasswordHash);
    await this.userRepository.save(user);
  }
}
