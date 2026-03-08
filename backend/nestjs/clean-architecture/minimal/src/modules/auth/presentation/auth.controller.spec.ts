import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { ValidateTokenCommand } from '../application/commands/validate-token.command';
import { UpdateProfileCommand } from '../application/commands/update-profile.command';
import { GetMyProfileQuery } from '../application/queries/get-my-profile.query';

describe('AuthController', () => {
  let controller: AuthController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  const mockCommandBus = {
    execute: jest.fn(),
  };

  const mockQueryBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: QueryBus, useValue: mockQueryBus },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('validateToken', () => {
    it('should call CommandBus.execute with ValidateTokenCommand', async () => {
      const response = {
        accessToken: 'internal-token',
        expiresIn: 900,
        user: { id: 1, email: 'user@test.com' },
      };
      mockCommandBus.execute.mockResolvedValue(response);

      const dto = { token: 'external-jwt-token' };
      const result = await controller.validateToken(dto);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new ValidateTokenCommand('external-jwt-token'),
      );
      expect(result).toEqual(response);
    });
  });

  describe('me', () => {
    it('should return user info from JWT claims', async () => {
      const user = { sub: 1, email: 'admin@test.com', username: 'admin', role: 'admin' };
      const result = await controller.me(user);

      expect(result).toBeDefined();
      expect(result.email).toBe('admin@test.com');
    });
  });

  describe('getProfile', () => {
    it('should call QueryBus.execute with GetMyProfileQuery', async () => {
      const profile = {
        id: 1,
        email: 'admin@test.com',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      };
      mockQueryBus.execute.mockResolvedValue(profile);

      const user = { sub: 1, email: 'admin@test.com', username: 'admin', role: 'admin' };
      const result = await controller.getProfile(user);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new GetMyProfileQuery(1),
      );
      expect(result).toEqual(profile);
    });
  });

  describe('updateProfile', () => {
    it('should call CommandBus.execute with UpdateProfileCommand', async () => {
      const updatedProfile = {
        id: 1,
        email: 'admin@test.com',
        username: 'admin',
        firstName: 'Updated',
        lastName: 'Name',
        role: 'admin',
      };
      mockCommandBus.execute.mockResolvedValue(updatedProfile);

      const user = { sub: 1, email: 'admin@test.com', username: 'admin', role: 'admin' };
      const dto = { firstName: 'Updated', lastName: 'Name' };
      const result = await controller.updateProfile(user, dto);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new UpdateProfileCommand(1, 'Updated', 'Name'),
      );
      expect(result).toEqual(updatedProfile);
    });
  });
});
