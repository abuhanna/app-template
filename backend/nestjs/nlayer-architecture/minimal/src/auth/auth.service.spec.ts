import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
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
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    get fullName() {
      if (this.firstName && this.lastName) return `${this.firstName} ${this.lastName}`;
      return this.firstName || this.lastName || null;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
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
            get: jest.fn().mockReturnValue('test-secret'),
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

  describe('validateToken', () => {
    it('should return access token for valid external token with existing user', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({
        email: 'john@example.com',
        username: 'johndoe',
      });
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateToken('external-token');

      expect(jwtService.verify).toHaveBeenCalledWith('external-token');
      expect(result).toHaveProperty('accessToken', 'jwt-token');
      expect(result).toHaveProperty('expiresIn', 900);
      expect(result.user).toHaveProperty('username', 'johndoe');
    });

    it('should create user when not found and return access token', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({
        email: 'new@example.com',
        username: 'newuser',
        role: 'user',
      });
      mockUserRepository.findOne.mockResolvedValue(null);
      const newUser = { ...mockUser, id: 2, username: 'newuser', email: 'new@example.com' };
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);

      const result = await service.validateToken('external-token');

      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.validateToken('bad-token')).rejects.toThrow();
    });
  });

  describe('getMe', () => {
    it('should return user info', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.getMe(1);

      expect(result).toHaveProperty('username', 'johndoe');
      expect(result).toHaveProperty('email', 'john@example.com');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getMe(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProfile', () => {
    it('should return full profile', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.getProfile(1);

      expect(result).toHaveProperty('username', 'johndoe');
      expect(result).toHaveProperty('firstName', 'John');
      expect(result).toHaveProperty('lastName', 'Doe');
      expect(result).toHaveProperty('createdAt');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update and return profile', async () => {
      const updatedUser = { ...mockUser, firstName: 'Jane' };
      Object.defineProperty(updatedUser, 'fullName', {
        get() {
          return this.firstName && this.lastName
            ? `${this.firstName} ${this.lastName}`
            : this.firstName || this.lastName || null;
        },
      });
      mockUserRepository.findOneBy.mockResolvedValue({ ...mockUser });
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(1, { firstName: 'Jane' });

      expect(result).toHaveProperty('firstName', 'Jane');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.updateProfile(999, { firstName: 'Jane' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
