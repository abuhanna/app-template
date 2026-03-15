import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtTokenService } from './jwt-token.service';
import { TokenPayload } from '../../domain/interfaces/jwt-token.service.interface';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtTokenService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<JwtTokenService>(JwtTokenService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTokens', () => {
    const payload: TokenPayload = {
      sub: 1,
      email: 'admin@test.com',
      username: 'admin',
      role: 'Admin',
    };

    beforeEach(() => {
      mockConfigService.get.mockImplementation((key: string, defaultValue?: string) => {
        switch (key) {
          case 'JWT_EXPIRES_IN':
            return defaultValue || '15m';
          case 'JWT_REFRESH_EXPIRES_IN':
            return defaultValue || '7d';
          case 'JWT_REFRESH_SECRET':
            return 'refresh-secret';
          default:
            return defaultValue;
        }
      });
      mockJwtService.sign.mockImplementation((_payload, options) => {
        if (options?.secret) {
          return 'mock-refresh-token';
        }
        return 'mock-access-token';
      });
    });

    it('should generate access and refresh tokens', async () => {
      const result = await service.generateTokens(payload);

      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('refreshToken', 'mock-refresh-token');
      expect(result).toHaveProperty('accessTokenExpiresAt');
      expect(result).toHaveProperty('refreshTokenExpiresAt');
    });

    it('should call jwtService.sign twice (access + refresh)', async () => {
      await service.generateTokens(payload);

      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should sign access token with payload (including jti) and expiresIn', async () => {
      await service.generateTokens(payload);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining(payload),
        { expiresIn: '15m' },
      );
      // Verify jti is included for uniqueness
      const accessCall = mockJwtService.sign.mock.calls[0];
      expect(accessCall[0]).toHaveProperty('jti');
    });

    it('should sign refresh token with payload (including jti), refresh secret, and expiresIn', async () => {
      await service.generateTokens(payload);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining(payload),
        { secret: 'refresh-secret', expiresIn: '7d' },
      );
      // Verify jti is included for uniqueness
      const refreshCall = mockJwtService.sign.mock.calls[1];
      expect(refreshCall[0]).toHaveProperty('jti');
    });

    it('should return expiry dates in the future', async () => {
      const before = new Date();
      const result = await service.generateTokens(payload);
      const after = new Date();

      expect(result.accessTokenExpiresAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(result.refreshTokenExpiresAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });

    it('should have refresh token expiry later than access token expiry', async () => {
      const result = await service.generateTokens(payload);

      expect(result.refreshTokenExpiresAt.getTime()).toBeGreaterThan(
        result.accessTokenExpiresAt.getTime(),
      );
    });
  });

  describe('verifyAccessToken', () => {
    it('should call jwtService.verify with the token', async () => {
      const expectedPayload: TokenPayload = {
        sub: 1,
        email: 'admin@test.com',
        username: 'admin',
        role: 'Admin',
      };
      mockJwtService.verify.mockReturnValue(expectedPayload);

      const result = await service.verifyAccessToken('some-access-token');

      expect(mockJwtService.verify).toHaveBeenCalledWith('some-access-token');
      expect(result).toEqual(expectedPayload);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should call jwtService.verify with the token and refresh secret', async () => {
      const expectedPayload: TokenPayload = {
        sub: 1,
        email: 'admin@test.com',
        username: 'admin',
        role: 'Admin',
      };
      mockConfigService.get.mockReturnValue('refresh-secret');
      mockJwtService.verify.mockReturnValue(expectedPayload);

      const result = await service.verifyRefreshToken('some-refresh-token');

      expect(mockJwtService.verify).toHaveBeenCalledWith('some-refresh-token', {
        secret: 'refresh-secret',
      });
      expect(result).toEqual(expectedPayload);
    });
  });

  describe('generatePasswordResetToken', () => {
    it('should return a string without dashes', () => {
      const token = service.generatePasswordResetToken();

      expect(typeof token).toBe('string');
      expect(token).not.toContain('-');
    });

    it('should return a 32-character hex string', () => {
      const token = service.generatePasswordResetToken();

      // UUID v4 without dashes = 32 hex characters
      expect(token).toHaveLength(32);
      expect(token).toMatch(/^[0-9a-f]{32}$/);
    });

    it('should generate unique tokens on consecutive calls', () => {
      const token1 = service.generatePasswordResetToken();
      const token2 = service.generatePasswordResetToken();

      expect(token1).not.toBe(token2);
    });
  });
});
