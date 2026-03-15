import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateToken(externalToken: string) {
    try {
      const decoded = this.jwtService.verify(externalToken);

      const payload = {
        sub: decoded.sub || decoded.username || decoded.email?.split('@')[0],
        email: decoded.email,
        username: decoded.username || decoded.sub || decoded.email?.split('@')[0],
        firstName: decoded.firstName || null,
        lastName: decoded.lastName || null,
        role: decoded.role || 'user',
        departmentId: decoded.departmentId || null,
        departmentName: decoded.departmentName || null,
      };

      const accessToken = this.jwtService.sign(payload);
      const expiresIn = this.getExpiresInSeconds();

      return {
        accessToken,
        expiresIn,
        user: {
          id: payload.sub,
          username: payload.username,
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          fullName: payload.firstName && payload.lastName
            ? `${payload.firstName} ${payload.lastName}`
            : payload.firstName || payload.lastName || null,
          role: payload.role,
          departmentId: payload.departmentId,
          departmentName: payload.departmentName,
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired external token');
    }
  }

  getMe(jwtPayload: any) {
    return {
      id: jwtPayload.sub,
      username: jwtPayload.username,
      email: jwtPayload.email,
      firstName: jwtPayload.firstName || null,
      lastName: jwtPayload.lastName || null,
      fullName: jwtPayload.firstName && jwtPayload.lastName
        ? `${jwtPayload.firstName} ${jwtPayload.lastName}`
        : jwtPayload.firstName || jwtPayload.lastName || null,
      role: jwtPayload.role,
      departmentId: jwtPayload.departmentId || null,
      departmentName: jwtPayload.departmentName || null,
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
