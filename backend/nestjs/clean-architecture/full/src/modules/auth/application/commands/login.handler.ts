import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { LoginCommand } from './login.command';
import { LoginResponseDto } from '../dto/login-response.dto';
import { UserDto } from '@/modules/user-management/application/dto/user.dto';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';
import { IPasswordService } from '../../domain/interfaces/password.service.interface';
import { IJwtTokenService } from '../../domain/interfaces/jwt-token.service.interface';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IPasswordService)
    private readonly passwordService: IPasswordService,
    @Inject(IJwtTokenService)
    private readonly jwtTokenService: IJwtTokenService,
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResponseDto> {
    // Find user by username or email
    let user = await this.userRepository.findByUsername(command.username);
    if (!user) {
      user = await this.userRepository.findByEmail(command.username);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.verify(command.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokenPair = await this.jwtTokenService.generateTokens({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // Save refresh token
    const refreshToken = RefreshToken.create({
      userId: user.id,
      token: tokenPair.refreshToken,
      expiresAt: tokenPair.refreshTokenExpiresAt,
    });
    await this.refreshTokenRepository.save(refreshToken);

    // Record login
    user.recordLogin();
    await this.userRepository.save(user);

    // Calculate expires in seconds
    const expiresIn = Math.floor(
      (tokenPair.accessTokenExpiresAt.getTime() - Date.now()) / 1000,
    );

    return new LoginResponseDto(
      tokenPair.accessToken,
      tokenPair.refreshToken,
      expiresIn,
      tokenPair.refreshTokenExpiresAt,
      new UserDto({
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        departmentId: user.departmentId,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
    );
  }
}
