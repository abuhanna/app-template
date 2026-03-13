import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { ValidateTokenCommand } from './validate-token.command';
import { ValidateTokenResponseDto } from '../dto/validate-token-response.dto';
import { UserInfoDto } from '../dto/user-info.dto';
import { IJwtTokenService } from '../../domain/interfaces/jwt-token.service.interface';

@CommandHandler(ValidateTokenCommand)
export class ValidateTokenHandler implements ICommandHandler<ValidateTokenCommand> {
  constructor(
    @Inject(IJwtTokenService)
    private readonly jwtTokenService: IJwtTokenService,
  ) {}

  async execute(command: ValidateTokenCommand): Promise<ValidateTokenResponseDto> {
    // Validate the external token using the shared secret
    let payload: any;
    try {
      payload = await this.jwtTokenService.verifyAccessToken(command.token);
    } catch {
      throw new UnauthorizedException('Invalid or expired external token');
    }

    if (!payload || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Extract user info from token claims (no local user store in minimal)
    const userId = String(payload.sub || payload.email);
    const username = payload.username || payload.email.split('@')[0];
    const role = payload.role || 'user';

    // Generate internal token
    const tokenPair = await this.jwtTokenService.generateTokens({
      sub: userId,
      email: payload.email,
      username,
      role,
    });

    const expiresIn = Math.floor(
      (tokenPair.accessTokenExpiresAt.getTime() - Date.now()) / 1000,
    );

    const userInfo = new UserInfoDto({
      id: userId,
      email: payload.email,
      username,
      firstName: payload.firstName || payload.given_name || '',
      lastName: payload.lastName || payload.family_name || '',
      fullName: `${payload.firstName || payload.given_name || ''} ${payload.lastName || payload.family_name || ''}`.trim(),
      role,
    });

    return new ValidateTokenResponseDto(tokenPair.accessToken, expiresIn, userInfo);
  }
}
