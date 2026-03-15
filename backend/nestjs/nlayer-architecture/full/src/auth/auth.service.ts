import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../services/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(identifier: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmailOrUsername(identifier);
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      if (!user.isActive) {
        throw new ForbiddenException('Account is deactivated');
      }
      return user;
    }
    return null;
  }

  async register(dto: { username: string; email: string; password: string; firstName?: string; lastName?: string }) {
    // Check for existing user
    const existingEmail = await this.userService.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }
    const existingUsername = await this.userService.findByUsername(dto.username);
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
      firstName: dto.firstName ?? undefined,
      lastName: dto.lastName ?? undefined,
      role: 'user',
      isActive: true,
    });
    const saved = await this.userRepository.save(user);
    // Reload with department
    const reloaded = await this.userRepository.findOne({
      where: { id: saved.id },
      relations: ['department'],
    });
    return this.generateTokens(reloaded!);
  }

  async login(user: User) {
    // Update last login
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });
    return this.generateTokens(user);
  }

  async refresh(refreshTokenValue: string) {
    try {
      const decoded = this.jwtService.verify(refreshTokenValue);
      const storedToken = await this.refreshTokenRepository.findOne({
        where: { token: refreshTokenValue, isRevoked: false },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = await this.userRepository.findOne({
        where: { id: decoded.sub },
        relations: ['department'],
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Revoke old refresh token
      storedToken.isRevoked = true;
      await this.refreshTokenRepository.save(storedToken);

      // Return tokens without user for refresh
      const payload = this.buildPayload(user);
      const accessToken = this.jwtService.sign(payload);
      const newRefreshToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      });

      const tokenEntity = this.refreshTokenRepository.create({
        userId: user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      await this.refreshTokenRepository.save(tokenEntity);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900,
      };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: number, refreshTokenValue?: string): Promise<void> {
    if (refreshTokenValue) {
      await this.refreshTokenRepository.update(
        { token: refreshTokenValue, userId },
        { isRevoked: true },
      );
    } else {
      await this.refreshTokenRepository.update(
        { userId, isRevoked: false },
        { isRevoked: true },
      );
    }
  }

  async getMe(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['department'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.buildUserResponse(user);
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['department'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userService.mapToDto(user);
  }

  async updateProfile(userId: number, dto: { firstName?: string; lastName?: string }) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;

    const updated = await this.userRepository.save(user);
    const reloaded = await this.userRepository.findOne({
      where: { id: updated.id },
      relations: ['department'],
    });
    return this.userService.mapToDto(reloaded!);
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }

  async forgotPassword(email: string): Promise<void> {
    // Always return success to prevent email enumeration
    // In production, send reset email here
    const user = await this.userRepository.findOneBy({ email });
    if (user) {
      // TODO: send reset email with token
    }
  }

  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<void> {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    // TODO: validate reset token and apply password change
    throw new BadRequestException('Invalid or expired token');
  }

  private async generateTokens(user: User) {
    const payload = this.buildPayload(user);

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const tokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await this.refreshTokenRepository.save(tokenEntity);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: this.buildUserResponse(user),
    };
  }

  private buildPayload(user: User) {
    return {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      departmentId: user.departmentId || null,
      departmentName: user.department?.name || null,
    };
  }

  private buildUserResponse(user: User) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      fullName: user.fullName,
      role: user.role,
      departmentId: user.departmentId || null,
      departmentName: user.department?.name || null,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
    };
  }
}
