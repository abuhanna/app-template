import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ChangePasswordCommand } from './change-password.command';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IPasswordService } from '@/modules/auth/domain/interfaces/password.service.interface';
import { IRefreshTokenRepository } from '@/modules/auth/domain/interfaces/refresh-token.repository.interface';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IPasswordService)
    private readonly passwordService: IPasswordService,
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await this.passwordService.verify(
      command.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await this.passwordService.hash(command.newPassword);

    // Update password
    user.updatePassword(passwordHash);
    await this.userRepository.save(user);

    // Revoke all refresh tokens for security
    await this.refreshTokenRepository.revokeAllByUserId(user.id);
  }
}
