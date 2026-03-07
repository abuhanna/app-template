import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../services/user.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserWithPassword = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: 'hashed-password',
    isActive: true,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data without passwordHash when credentials are valid', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(mockUserWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('john@example.com', 'password123');

      expect(userService.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toHaveProperty('email', 'john@example.com');
    });

    it('should return null when user is not found', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser('unknown@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password does not match', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(mockUserWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('john@example.com', 'wrong-password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token and user info', async () => {
      const user = { id: 1, name: 'John Doe', email: 'john@example.com' };

      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({ email: 'john@example.com', sub: 1 });
      expect(result).toEqual({
        access_token: 'jwt-token',
        user: { id: 1, name: 'John Doe', email: 'john@example.com' },
      });
    });
  });

  describe('register', () => {
    it('should create a user and return login response', async () => {
      const createUserDto = { name: 'Jane Doe', email: 'jane@example.com', password: 'password123' };
      const createdUser = { id: 2, name: 'Jane Doe', email: 'jane@example.com' };
      (userService.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await service.register(createUserDto);

      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({
        access_token: 'jwt-token',
        user: { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
      });
    });
  });
});
