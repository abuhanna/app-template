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
        sub: decoded.sub || decoded.email,
        email: decoded.email,
        username: decoded.username || decoded.sub || decoded.email?.split('@')[0],
        role: decoded.role || 'user',
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        expiresIn: 900,
        user: {
          id: payload.sub,
          username: payload.username,
          email: payload.email,
          role: payload.role,
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired external token');
    }
  }

  getMe(user: any) {
    return {
      id: user.userId,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}
