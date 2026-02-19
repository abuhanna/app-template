import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LogoutCommand } from './logout.command';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    if (command.refreshToken) {
      // Revoke specific refresh token
      await this.refreshTokenRepository.revokeByToken(command.refreshToken);
    } else {
      // Revoke all refresh tokens for user
      await this.refreshTokenRepository.revokeAllByUserId(command.userId);
    }
  }
}
