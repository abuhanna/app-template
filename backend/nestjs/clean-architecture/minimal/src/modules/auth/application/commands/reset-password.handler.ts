import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { ResetPasswordCommand } from './reset-password.command';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';
import { IPasswordService } from '../../domain/interfaces/password.service.interface';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IPasswordService)
    private readonly passwordService: IPasswordService,
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<void> {
    // Find user by reset token
    const user = await this.userRepository.findByPasswordResetToken(command.token);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (!user.isPasswordResetTokenValid(command.token)) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await this.passwordService.hash(command.newPassword);

    // Update password and clear reset token
    user.updatePassword(passwordHash);
    await this.userRepository.save(user);

    // Revoke all refresh tokens for security
    await this.refreshTokenRepository.revokeAllByUserId(user.id);
  }
}
