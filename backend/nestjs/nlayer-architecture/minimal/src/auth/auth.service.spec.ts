import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
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
    it('should return access token for valid external token', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({
        sub: 'user-1',
        email: 'john@example.com',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        departmentId: null,
        departmentName: null,
      });

      const result = await service.validateToken('external-token');

      expect(jwtService.verify).toHaveBeenCalledWith('external-token');
      expect(result).toHaveProperty('accessToken', 'jwt-token');
      expect(result).toHaveProperty('expiresIn', 900);
      expect(result.user).toHaveProperty('username', 'johndoe');
      expect(result.user).toHaveProperty('firstName', 'John');
      expect(result.user).toHaveProperty('lastName', 'Doe');
      expect(result.user).toHaveProperty('fullName', 'John Doe');
      expect(result.user).toHaveProperty('departmentId', null);
      expect(result.user).toHaveProperty('departmentName', null);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.validateToken('bad-token')).rejects.toThrow();
    });
  });

  describe('getMe', () => {
    it('should return user info from JWT claims', () => {
      const jwtPayload = {
        sub: 'user-1',
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        departmentId: null,
        departmentName: null,
      };

      const result = service.getMe(jwtPayload);

      expect(result).toEqual({
        id: 'user-1',
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        role: 'user',
        departmentId: null,
        departmentName: null,
      });
    });
  });
});
