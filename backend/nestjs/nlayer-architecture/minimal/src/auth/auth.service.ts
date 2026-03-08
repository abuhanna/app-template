import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateToken(externalToken: string) {
    try {
      // Decode the external token (shared secret or public key)
      const decoded = this.jwtService.verify(externalToken);

      // Find or create user from external token claims
      let user = await this.userRepository.findOne({
        where: [{ email: decoded.email }, { username: decoded.username || decoded.sub }],
      });

      if (!user) {
        user = this.userRepository.create({
          username: decoded.username || decoded.sub || decoded.email.split('@')[0],
          email: decoded.email,
          firstName: decoded.firstName ?? undefined,
          lastName: decoded.lastName ?? undefined,
          role: decoded.role || 'user',
          isActive: true,
        });
        user = await this.userRepository.save(user);
      }

      // Issue internal access token
      const payload = this.buildPayload(user);
      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        expiresIn: 900,
        user: this.buildUserResponse(user),
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired external token');
    }
  }

  async getMe(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.buildUserResponse(user);
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      fullName: user.fullName,
      role: user.role,
      departmentId: user.departmentId || null,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
    };
  }

  async updateProfile(userId: number, dto: { firstName?: string; lastName?: string }) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;

    const updated = await this.userRepository.save(user);
    return {
      id: updated.id,
      username: updated.username,
      email: updated.email,
      firstName: updated.firstName || null,
      lastName: updated.lastName || null,
      fullName: updated.fullName,
      role: updated.role,
      departmentId: updated.departmentId || null,
      isActive: updated.isActive,
      lastLoginAt: updated.lastLoginAt ? updated.lastLoginAt.toISOString() : null,
      createdAt: updated.createdAt?.toISOString(),
      updatedAt: updated.updatedAt ? updated.updatedAt.toISOString() : null,
    };
  }

  private buildPayload(user: User) {
    return {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      departmentId: user.departmentId || null,
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
      isActive: user.isActive,
    };
  }
}
