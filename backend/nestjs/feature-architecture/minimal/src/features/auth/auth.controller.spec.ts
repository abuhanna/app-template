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
    user: { id: 1, username: 'admin', email: 'admin@example.com' },
  };

  const mockUserInfo = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    fullName: 'Admin User',
    role: 'admin',
    departmentId: null,
    departmentName: null,
    isActive: true,
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
            getProfile: jest.fn(),
            updateProfile: jest.fn(),
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

      const result = await controller.me({ user: { sub: 1, username: 'admin', email: 'admin@example.com', role: 'admin' } });

      expect(authService.getMe).toHaveBeenCalled();
      expect(result).toEqual(mockUserInfo);
    });
  });

  describe('getProfile', () => {
    it('should return full user profile from database', async () => {
      (authService.getProfile as jest.Mock).mockResolvedValue(mockUserInfo);

      const result = await controller.getProfile({ user: { userId: 1 } });

      expect(authService.getProfile).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUserInfo);
    });
  });

  describe('updateProfile', () => {
    it('should update and return user profile', async () => {
      const updatedProfile = { ...mockUserInfo, firstName: 'Updated' };
      (authService.updateProfile as jest.Mock).mockResolvedValue(updatedProfile);

      const result = await controller.updateProfile(
        { user: { userId: 1 } },
        { firstName: 'Updated', lastName: 'User' },
      );

      expect(authService.updateProfile).toHaveBeenCalledWith(1, { firstName: 'Updated', lastName: 'User' });
      expect(result).toEqual(updatedProfile);
    });
  });
});
