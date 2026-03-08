import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateToken: jest.fn(),
    getMe: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('validateToken', () => {
    it('should validate external token and return access token', async () => {
      const tokenResponse = {
        accessToken: 'jwt-token',
        expiresIn: 900,
        user: { id: 1, username: 'johndoe', email: 'john@example.com' },
      };
      mockAuthService.validateToken.mockResolvedValue(tokenResponse);

      const result = await controller.validateToken({ token: 'external-token' });

      expect(authService.validateToken).toHaveBeenCalledWith('external-token');
      expect(result).toEqual(tokenResponse);
    });
  });

  describe('me', () => {
    it('should return current user info', async () => {
      const userInfo = {
        id: 1,
        username: 'johndoe',
        email: 'john@example.com',
        firstName: null,
        lastName: null,
        fullName: null,
        role: 'user',
        departmentId: null,
        isActive: true,
      };
      mockAuthService.getMe.mockResolvedValue(userInfo);

      const result = await controller.me({ user: { userId: 1 } });

      expect(authService.getMe).toHaveBeenCalledWith(1);
      expect(result).toEqual(userInfo);
    });
  });

  describe('getProfile', () => {
    it('should return full user profile', async () => {
      const profile = {
        id: 1,
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        role: 'user',
        departmentId: null,
        isActive: true,
        lastLoginAt: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: null,
      };
      mockAuthService.getProfile.mockResolvedValue(profile);

      const result = await controller.getProfile({ user: { userId: 1 } });

      expect(authService.getProfile).toHaveBeenCalledWith(1);
      expect(result).toEqual(profile);
    });
  });

  describe('updateProfile', () => {
    it('should update and return profile', async () => {
      const updated = {
        id: 1,
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        fullName: 'Jane Doe',
        role: 'user',
        departmentId: null,
        isActive: true,
        lastLoginAt: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      };
      mockAuthService.updateProfile.mockResolvedValue(updated);

      const result = await controller.updateProfile(
        { user: { userId: 1 } },
        { firstName: 'Jane' },
      );

      expect(authService.updateProfile).toHaveBeenCalledWith(1, { firstName: 'Jane' });
      expect(result).toEqual(updated);
    });
  });
});
