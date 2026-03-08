import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = {
    id: 1,
    username: 'johndoe',
    email: 'john@example.com',
    passwordHash: 'hash',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    departmentId: null,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    get fullName() { return 'John Doe'; },
    get departmentName() { return null; },
  } as any;

  const mockLoginResponse = {
    accessToken: 'jwt-token',
    refreshToken: 'refresh-token',
    expiresIn: 900,
    user: {
      id: 1,
      username: 'johndoe',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      role: 'user',
      departmentId: null,
      departmentName: null,
      isActive: true,
    },
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
            register: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
            getMe: jest.fn(),
            getProfile: jest.fn(),
            updateProfile: jest.fn(),
            changePassword: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
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

  describe('register', () => {
    it('should register a new user and return auth response', async () => {
      const registerDto = { username: 'janedoe', email: 'jane@example.com', password: 'password123' };
      (authService.register as jest.Mock).mockResolvedValue(mockLoginResponse);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens', async () => {
      const refreshResponse = { accessToken: 'new-token', refreshToken: 'new-refresh', expiresIn: 900 };
      (authService.refresh as jest.Mock).mockResolvedValue(refreshResponse);

      const result = await controller.refresh({ refreshToken: 'old-token' });

      expect(authService.refresh).toHaveBeenCalledWith('old-token');
      expect(result).toEqual(refreshResponse);
    });
  });

  describe('me', () => {
    it('should return current user info', async () => {
      const meResponse = { id: 1, username: 'johndoe', email: 'john@example.com', role: 'user' };
      (authService.getMe as jest.Mock).mockReturnValue(meResponse);

      const result = await controller.me({ user: { userId: 1, sub: '1', email: 'john@example.com' } });

      expect(result).toEqual(meResponse);
    });
  });
});
