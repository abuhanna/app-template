import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { UserService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateToken(externalToken: string) {
    try {
      // In production, validate against external identity provider
      // For template, decode the token to extract claims
      const decoded = this.jwtService.verify(externalToken, {
        secret: this.configService.get<string>('JWT_EXTERNAL_SECRET') || this.configService.get<string>('JWT_SECRET') || 'secretKey',
      });

      // Create or update local user from external claims
      const user = await this.userService.createFromExternal({
        username: decoded.username || decoded.sub || decoded.email?.split('@')[0],
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        role: decoded.role || 'user',
        departmentId: decoded.departmentId ? parseInt(decoded.departmentId) : undefined,
      });

      // Generate internal JWT
      const payload = this.buildJwtPayload(user);
      const accessToken = this.jwtService.sign(payload);
      const expiresIn = this.getExpiresInSeconds();

      return {
        accessToken,
        expiresIn,
        user: this.buildUserResponse(user),
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired external token');
    }
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
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userService.mapToDto(user);
  }

  async updateProfile(userId: number, dto: { firstName?: string; lastName?: string }) {
    const user = await this.userService.updateProfile(userId, dto);
    return this.userService.mapToDto(user);
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
      departmentName: null,
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
      departmentName: null,
      isActive: user.isActive,
    };
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
    return 900;
  }
}
