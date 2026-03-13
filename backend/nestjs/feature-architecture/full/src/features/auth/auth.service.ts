import { Injectable, UnauthorizedException, ConflictException, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../users/user.entity';
import { RefreshToken } from './refresh-token.entity';
import { UserService } from '../users/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(identifier: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmailOrUsername(identifier);
    if (user && user.passwordHash && (await bcrypt.compare(password, user.passwordHash))) {
      return user;
    }
    return null;
  }

  async register(dto: { username: string; email: string; password: string; firstName?: string; lastName?: string }) {
    // Check duplicates
    const existingEmail = await this.userService.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }
    const existingUsername = await this.userService.findByUsername(dto.username);
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const newUser = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
      firstName: dto.firstName ?? undefined,
      lastName: dto.lastName ?? undefined,
      role: 'user',
      isActive: true,
    });
    const savedUser = await this.userRepository.save(newUser);
    // Re-fetch with department relation
    const fullUser = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['department'],
    });
    return this.generateAuthResponse(fullUser!);
  }

  async login(user: User) {
    if (!user.isActive) {
      throw new ForbiddenException('Account deactivated');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return this.generateAuthResponse(user);
  }

  async refresh(refreshTokenValue: string) {
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenValue, isRevoked: false },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findOne({
      where: { id: storedToken.userId },
      relations: ['department'],
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Revoke old refresh token
    storedToken.isRevoked = true;
    await this.refreshTokenRepository.save(storedToken);

    // Generate new tokens (no user in refresh response)
    return this.generateRefreshResponse(user);
  }

  async logout(userId: number): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  getMe(jwtPayload: any) {
    return {
      id: parseInt(jwtPayload.sub),
      username: jwtPayload.username,
      email: jwtPayload.email,
      firstName: jwtPayload.firstName || null,
      lastName: jwtPayload.lastName || null,
      fullName: jwtPayload.firstName && jwtPayload.lastName
        ? `${jwtPayload.firstName} ${jwtPayload.lastName}`
        : jwtPayload.firstName || jwtPayload.lastName || null,
      role: jwtPayload.role,
      departmentId: jwtPayload.departmentId ? parseInt(jwtPayload.departmentId) : null,
      departmentName: jwtPayload.departmentName || null,
      isActive: true,
    };
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
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['department'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    const saved = await this.userRepository.save(user);
    // Re-fetch to get department relation
    const updated = await this.userRepository.findOne({
      where: { id: saved.id },
      relations: ['department'],
    });
    return this.userService.mapToDto(updated!);
  }

  async changePassword(userId: number, dto: { currentPassword: string; newPassword: string; confirmPassword: string }) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.passwordHash) {
      throw new BadRequestException('Password not set for this account');
    }
    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save(user);
  }

  async forgotPassword(email: string) {
    // Always return success to prevent email enumeration
    const user = await this.userService.findByEmail(email);
    if (user) {
      // In production, send email with reset token
      const resetToken = crypto.randomUUID();
      user.passwordResetToken = resetToken;
      user.passwordResetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await this.userRepository.save(user);
    }
  }

  async resetPassword(dto: { token: string; newPassword: string; confirmPassword: string }) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userRepository.findOneBy({ passwordResetToken: dto.token });
    if (!user || !user.passwordResetTokenExpiresAt || user.passwordResetTokenExpiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetTokenExpiresAt = null;
    await this.userRepository.save(user);
  }

  private async generateAuthResponse(user: User) {
    const payload = this.buildJwtPayload(user);
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.createRefreshToken(user.id);
    const expiresIn = this.getExpiresInSeconds();

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: this.buildUserResponse(user),
    };
  }

  private async generateRefreshResponse(user: User) {
    const payload = this.buildJwtPayload(user);
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.createRefreshToken(user.id);
    const expiresIn = this.getExpiresInSeconds();

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private buildJwtPayload(user: User) {
    return {
      sub: user.id.toString(),
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      departmentId: user.departmentId?.toString() || null,
      departmentName: user.departmentName || null,
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
      departmentName: user.departmentName || null,
      isActive: user.isActive,
    };
  }

  private async createRefreshToken(userId: number): Promise<string> {
    const token = crypto.randomUUID();
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const days = parseInt(refreshExpiresIn) || 7;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const tokenEntity = this.refreshTokenRepository.create({
      userId,
      token,
      expiresAt,
    });
    await this.refreshTokenRepository.save(tokenEntity);
    return token;
  }

  private getExpiresInSeconds(): number {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '15m');
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (match) {
      const value = parseInt(match[1]);
      switch (match[2]) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 3600;
        case 'd': return value * 86400;
      }
    }
    return 900; // default 15 minutes
  }
}
