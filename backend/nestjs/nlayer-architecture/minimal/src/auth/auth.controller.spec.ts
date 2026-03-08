import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
  const mockLoginResponse = {
    accessToken: 'jwt-token',
    refreshToken: 'refresh-token',
    user: { id: 1, name: 'John Doe', email: 'john@example.com' },
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

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return tokens when credentials are valid', async () => {
      (authService.validateUser as jest.Mock).mockResolvedValue(mockUser);
      (authService.login as jest.Mock).mockResolvedValue(mockLoginResponse);

      const result = await controller.login({ email: 'john@example.com', password: 'password123' });

      expect(authService.validateUser).toHaveBeenCalledWith('john@example.com', 'password123');
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      (authService.validateUser as jest.Mock).mockResolvedValue(null);

      await expect(
        controller.login({ email: 'john@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return new tokens', async () => {
      (authService.refresh as jest.Mock).mockResolvedValue(mockLoginResponse);

      const result = await controller.refresh({ refreshToken: 'old-refresh-token' });

      expect(authService.refresh).toHaveBeenCalledWith('old-refresh-token');
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('me', () => {
    it('should return current user info', async () => {
      const userInfo = { id: 1, name: 'John Doe', email: 'john@example.com', isActive: true };
      (authService.getMe as jest.Mock).mockResolvedValue(userInfo);

      const result = await controller.me({ user: { userId: 1 } });

      expect(authService.getMe).toHaveBeenCalledWith(1);
      expect(result).toEqual(userInfo);
    });
  });
});
