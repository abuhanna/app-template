import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateToken: jest.fn(),
    getMe: jest.fn(),
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
        user: {
          id: 'user-1',
          username: 'johndoe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'user',
          departmentId: null,
          departmentName: null,
        },
      };
      mockAuthService.validateToken.mockResolvedValue(tokenResponse);

      const result = await controller.validateToken({ token: 'external-token' });

      expect(authService.validateToken).toHaveBeenCalledWith('external-token');
      expect(result).toEqual(tokenResponse);
    });
  });

  describe('me', () => {
    it('should return current user info from JWT claims', async () => {
      const userInfo = {
        id: 'user-1',
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        role: 'user',
        departmentId: null,
        departmentName: null,
      };
      mockAuthService.getMe.mockReturnValue(userInfo);

      const req = {
        user: {
          userId: 'user-1',
          sub: 'user-1',
          username: 'johndoe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          departmentId: null,
          departmentName: null,
        },
      };
      const result = await controller.me(req);

      expect(authService.getMe).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(userInfo);
    });
  });
});
