import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { ValidateTokenCommand } from './validate-token.command';
import { ValidateTokenResponseDto } from '../dto/validate-token-response.dto';
import { UserInfoDto } from '../dto/user-info.dto';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';
import { User } from '@/modules/user-management/domain/entities/user.entity';
import { UserRole } from '@/modules/user-management/domain/value-objects/user-role';
import { IJwtTokenService } from '../../domain/interfaces/jwt-token.service.interface';

@CommandHandler(ValidateTokenCommand)
export class ValidateTokenHandler implements ICommandHandler<ValidateTokenCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
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

    // Find or create local user from token claims
    let user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      // Auto-create user from external claims
      user = User.create({
        email: payload.email,
        username: payload.username || payload.email.split('@')[0],
        passwordHash: '', // External auth - no password
        firstName: payload.firstName || payload.given_name || '',
        lastName: payload.lastName || payload.family_name || '',
        role: UserRole.User,
      });
      user = await this.userRepository.save(user);
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    // Generate internal token
    const tokenPair = await this.jwtTokenService.generateTokens({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const expiresIn = Math.floor(
      (tokenPair.accessTokenExpiresAt.getTime() - Date.now()) / 1000,
    );

    const userInfo = new UserInfoDto({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      departmentId: user.departmentId,
      departmentName: null,
    });

    return new ValidateTokenResponseDto(tokenPair.accessToken, expiresIn, userInfo);
  }
}
