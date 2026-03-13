import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockValidateTokenResponse = {
    accessToken: 'jwt-token',
    expiresIn: 900,
    user: { id: 'admin', username: 'admin', email: 'admin@example.com' },
  };

  const mockUserInfo = {
    id: 'admin',
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    fullName: 'Admin User',
    role: 'admin',
    departmentId: null,
    departmentName: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateToken: jest.fn(),
            getMe: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('validateToken', () => {
    it('should return tokens when external token is valid', async () => {
      (authService.validateToken as jest.Mock).mockResolvedValue(mockValidateTokenResponse);

      const result = await controller.validateToken({ token: 'external-jwt-token' });

      expect(authService.validateToken).toHaveBeenCalledWith('external-jwt-token');
      expect(result).toEqual(mockValidateTokenResponse);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      (authService.validateToken as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Invalid or expired external token'),
      );

      await expect(
        controller.validateToken({ token: 'bad-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('me', () => {
    it('should return current user info from JWT payload', async () => {
      (authService.getMe as jest.Mock).mockReturnValue(mockUserInfo);

      const result = await controller.me({ user: { sub: 'admin', username: 'admin', email: 'admin@example.com', role: 'admin' } });

      expect(authService.getMe).toHaveBeenCalled();
      expect(result).toEqual(mockUserInfo);
    });
  });
});
