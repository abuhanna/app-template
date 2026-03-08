import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { UserService } from '../services/user.service';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockRefreshTokenRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockUserService = {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    findByEmailOrUsername: jest.fn(),
    mapToDto: jest.fn(),
  };

  const mockUser = {
    id: 1,
    username: 'johndoe',
    email: 'john@example.com',
    passwordHash: 'hashed-password',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    departmentId: null,
    department: null,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    get fullName() {
      return 'John Doe';
    },
    get departmentName() {
      return null;
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('jwt-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('7d'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      mockUserService.findByEmailOrUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('john@example.com', 'password123');

      expect(mockUserService.findByEmailOrUsername).toHaveBeenCalledWith('john@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      mockUserService.findByEmailOrUsername.mockResolvedValue(null);

      const result = await service.validateUser('unknown@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password does not match', async () => {
      mockUserService.findByEmailOrUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('john@example.com', 'wrong-password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token, refresh token, and user info', async () => {
      mockUserRepository.update.mockResolvedValue({});
      mockRefreshTokenRepository.create.mockReturnValue({ userId: 1, token: 'jwt-token' });
      mockRefreshTokenRepository.save.mockResolvedValue({});

      const result = await service.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn', 900);
      expect(result.user).toHaveProperty('email', 'john@example.com');
      expect(result.user).toHaveProperty('username', 'johndoe');
    });
  });

  describe('register', () => {
    it('should create a user and return tokens', async () => {
      const registerDto = {
        username: 'janedoe',
        email: 'jane@example.com',
        password: 'password123',
      };
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.findByUsername.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserRepository.create.mockReturnValue({ ...mockUser, username: 'janedoe' });
      mockUserRepository.save.mockResolvedValue({ ...mockUser, id: 2, username: 'janedoe' });
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser, id: 2, username: 'janedoe' });
      mockRefreshTokenRepository.create.mockReturnValue({});
      mockRefreshTokenRepository.save.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn', 900);
    });
  });
});
