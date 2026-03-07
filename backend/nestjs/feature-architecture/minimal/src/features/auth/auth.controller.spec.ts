import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
  const mockLoginResponse = {
    access_token: 'jwt-token',
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
            register: jest.fn(),
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
    it('should return a JWT token when credentials are valid', async () => {
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

      expect(authService.validateUser).toHaveBeenCalledWith('john@example.com', 'wrong');
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should register a new user and return login response', async () => {
      const createUserDto = { name: 'Jane Doe', email: 'jane@example.com', password: 'password123' };
      (authService.register as jest.Mock).mockResolvedValue(mockLoginResponse);

      const result = await controller.register(createUserDto);

      expect(authService.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockLoginResponse);
    });
  });
});
