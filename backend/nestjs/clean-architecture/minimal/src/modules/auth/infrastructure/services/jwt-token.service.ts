import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import {
  IJwtTokenService,
  TokenPayload,
  TokenPair,
} from '../../domain/interfaces/jwt-token.service.interface';

@Injectable()
export class JwtTokenService implements IJwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: TokenPayload): Promise<TokenPair> {
    const accessTokenExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '15m');
    const refreshTokenExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpiresIn,
    });

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshTokenExpiresIn,
    });

    // Calculate expiry dates
    const accessTokenExpiresAt = this.calculateExpiryDate(accessTokenExpiresIn);
    const refreshTokenExpiresAt = this.calculateExpiryDate(refreshTokenExpiresIn);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verify<TokenPayload>(token);
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    return this.jwtService.verify<TokenPayload>(token, { secret: refreshSecret });
  }

  generatePasswordResetToken(): string {
    return uuidv4().replace(/-/g, '');
  }

  private calculateExpiryDate(expiresIn: string): Date {
    const now = Date.now();
    let ms = 0;

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];

      switch (unit) {
        case 's':
          ms = value * 1000;
          break;
        case 'm':
          ms = value * 60 * 1000;
          break;
        case 'h':
          ms = value * 60 * 60 * 1000;
          break;
        case 'd':
          ms = value * 24 * 60 * 60 * 1000;
          break;
      }
    }

    return new Date(now + ms);
  }
}
