import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RequestPasswordResetCommand } from './request-password-reset.command';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';
import { IJwtTokenService } from '../../domain/interfaces/jwt-token.service.interface';
import { IEmailService } from '../../domain/interfaces/email.service.interface';

@CommandHandler(RequestPasswordResetCommand)
export class RequestPasswordResetHandler implements ICommandHandler<RequestPasswordResetCommand> {
  private readonly logger = new Logger(RequestPasswordResetHandler.name);

  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IJwtTokenService)
    private readonly jwtTokenService: IJwtTokenService,
    @Inject(IEmailService)
    private readonly emailService: IEmailService,
  ) {}

  async execute(command: RequestPasswordResetCommand): Promise<void> {
    // Find user by email (don't reveal if user exists)
    const user = await this.userRepository.findByEmail(command.email);

    if (!user || !user.isActive) {
      // Log but don't throw - prevent email enumeration
      this.logger.log(`Password reset requested for non-existent/inactive email: ${command.email}`);
      return;
    }

    // Generate reset token
    const resetToken = this.jwtTokenService.generatePasswordResetToken();
    user.setPasswordResetToken(resetToken, 24); // 24 hours expiry

    await this.userRepository.save(user);

    // Send email
    try {
      await this.emailService.sendPasswordResetEmail(user.email, resetToken, user.fullName);
      this.logger.log(`Password reset email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${user.email}`, error);
      // Don't throw - user already has token, they can try again
    }
  }
}
