import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenCommand } from './refresh-token.command';
import { LoginResponseDto } from '../dto/login-response.dto';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';
import { IJwtTokenService } from '../../domain/interfaces/jwt-token.service.interface';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IJwtTokenService)
    private readonly jwtTokenService: IJwtTokenService,
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<LoginResponseDto> {
    // Find refresh token
    const existingToken = await this.refreshTokenRepository.findByToken(command.refreshToken);

    if (!existingToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!existingToken.isValid()) {
      throw new UnauthorizedException('Refresh token is expired or revoked');
    }

    // Find user
    const user = await this.userRepository.findById(existingToken.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or disabled');
    }

    // Generate new tokens
    const tokenPair = await this.jwtTokenService.generateTokens({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // Revoke old token and save new one (token rotation)
    existingToken.revoke(tokenPair.refreshToken);
    await this.refreshTokenRepository.save(existingToken);

    const newRefreshToken = RefreshToken.create({
      userId: user.id,
      token: tokenPair.refreshToken,
      expiresAt: tokenPair.refreshTokenExpiresAt,
    });
    await this.refreshTokenRepository.save(newRefreshToken);

    // Calculate expires in seconds
    const expiresIn = Math.floor(
      (tokenPair.accessTokenExpiresAt.getTime() - Date.now()) / 1000,
    );

    return new LoginResponseDto(
      tokenPair.accessToken,
      tokenPair.refreshToken,
      expiresIn,
    );
  }
}
