import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

// Mock UserService since users module may not exist in minimal variant
const mockUserService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: 'hashed-password',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'UserService',
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('signed-jwt-token'),
          },
        },
      ],
    })
      .overrideProvider(AuthService)
      .useFactory({
        factory: (jwtSvc: JwtService) => {
          const authService = new AuthService(mockUserService as any, jwtSvc);
          return authService;
        },
        inject: [JwtService],
      })
      .compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without passwordHash when credentials are valid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('john@example.com', 'password123');

      expect(mockUserService.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(result).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        isActive: true,
        createdAt: mockUser.createdAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should return null when user is not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('unknown@example.com', 'password123');

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when password does not match', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('john@example.com', 'wrong-password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user info', async () => {
      const user = { id: 1, name: 'John Doe', email: 'john@example.com' };

      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({ email: 'john@example.com', sub: 1 });
      expect(result).toEqual({
        access_token: 'signed-jwt-token',
        user: { id: 1, name: 'John Doe', email: 'john@example.com' },
      });
    });
  });

  describe('register', () => {
    it('should create a user and return login result', async () => {
      const createUserDto = { name: 'Jane Doe', email: 'jane@example.com', password: 'password123' };
      const createdUser = { id: 2, name: 'Jane Doe', email: 'jane@example.com' };

      mockUserService.create.mockResolvedValue(createdUser);

      const result = await service.register(createUserDto);

      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
      expect(jwtService.sign).toHaveBeenCalledWith({ email: 'jane@example.com', sub: 2 });
      expect(result).toEqual({
        access_token: 'signed-jwt-token',
        user: { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
      });
    });
  });
});
