import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import { RegisterCommand } from './register.command';
import { LoginResponseDto } from '../dto/login-response.dto';
import { UserDto } from '@/modules/user-management/application/dto/user.dto';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';
import { User } from '@/modules/user-management/domain/entities/user.entity';
import { UserRole } from '@/modules/user-management/domain/value-objects/user-role';
import { IPasswordService } from '../../domain/interfaces/password.service.interface';
import { IJwtTokenService } from '../../domain/interfaces/jwt-token.service.interface';
import { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token.repository.interface';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
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

  async execute(command: RegisterCommand): Promise<LoginResponseDto> {
    // Check if email already exists
    const existingByEmail = await this.userRepository.findByEmail(command.email);
    if (existingByEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if username already exists
    const existingByUsername = await this.userRepository.findByUsername(command.username);
    if (existingByUsername) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(command.password);

    // Create user
    const user = User.create({
      email: command.email,
      username: command.username,
      passwordHash,
      firstName: command.firstName || '',
      lastName: command.lastName || '',
      role: UserRole.User,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate tokens
    const tokenPair = await this.jwtTokenService.generateTokens({
      sub: savedUser.id,
      email: savedUser.email,
      username: savedUser.username,
      role: savedUser.role,
    });

    // Save refresh token
    const refreshToken = RefreshToken.create({
      userId: savedUser.id,
      token: tokenPair.refreshToken,
      expiresAt: tokenPair.refreshTokenExpiresAt,
    });
    await this.refreshTokenRepository.save(refreshToken);

    // Calculate expires in seconds
    const expiresIn = Math.floor(
      (tokenPair.accessTokenExpiresAt.getTime() - Date.now()) / 1000,
    );

    return new LoginResponseDto(
      tokenPair.accessToken,
      tokenPair.refreshToken,
      expiresIn,
      new UserDto({
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        fullName: savedUser.fullName,
        role: savedUser.role,
        departmentId: savedUser.departmentId,
        isActive: savedUser.isActive,
        lastLoginAt: savedUser.lastLoginAt,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      }),
    );
  }
}
