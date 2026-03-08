import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = { id: 1, name: 'admin', email: 'admin@example.com', passwordHash: 'hash', isActive: true, createdAt: new Date(), updatedAt: new Date() };
  const mockLoginResponse = {
    accessToken: 'jwt-token',
    refreshToken: 'refresh-token',
    user: { id: 1, name: 'admin', email: 'admin@example.com' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
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

  describe('login', () => {
    it('should return tokens when credentials are valid', async () => {
      (authService.validateUser as jest.Mock).mockResolvedValue(mockUser);
      (authService.login as jest.Mock).mockResolvedValue(mockLoginResponse);

      const result = await controller.login({ email: 'admin@example.com', password: 'Admin@123' });

      expect(authService.validateUser).toHaveBeenCalledWith('admin@example.com', 'Admin@123');
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      (authService.validateUser as jest.Mock).mockResolvedValue(null);

      await expect(
        controller.login({ email: 'admin@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens', async () => {
      (authService.refresh as jest.Mock).mockResolvedValue(mockLoginResponse);

      const result = await controller.refresh({ refreshToken: 'old-token' });

      expect(authService.refresh).toHaveBeenCalledWith('old-token');
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      await controller.logout({ user: { userId: 1 } }, { refreshToken: 'token' });

      expect(authService.logout).toHaveBeenCalledWith(1, 'token');
    });
  });

  describe('me', () => {
    it('should return current user info', async () => {
      const userInfo = { id: 1, name: 'admin', email: 'admin@example.com', isActive: true };
      (authService.getMe as jest.Mock).mockResolvedValue(userInfo);

      const result = await controller.me({ user: { userId: 1 } });

      expect(authService.getMe).toHaveBeenCalledWith(1);
      expect(result).toEqual(userInfo);
    });
  });
});
