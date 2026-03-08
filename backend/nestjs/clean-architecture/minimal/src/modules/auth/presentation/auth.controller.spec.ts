import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { LoginCommand } from '../application/commands';
import { LogoutCommand } from '../application/commands';
import { GetCurrentUserQuery } from '../application/queries';
import { RefreshTokenCommand } from '../application/commands';

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

  describe('login', () => {
    it('should call CommandBus.execute with LoginCommand using username', async () => {
      const loginResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      mockCommandBus.execute.mockResolvedValue(loginResponse);

      const dto = { username: 'admin', password: 'Admin@123' };
      const result = await controller.login(dto);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.any(LoginCommand),
      );
      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new LoginCommand('admin', 'Admin@123'),
      );
      expect(result).toEqual(loginResponse);
    });

    it('should call CommandBus.execute with LoginCommand using email', async () => {
      const loginResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      mockCommandBus.execute.mockResolvedValue(loginResponse);

      const dto = { email: 'admin@test.com', password: 'Admin@123' };
      const result = await controller.login(dto);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new LoginCommand('admin@test.com', 'Admin@123'),
      );
      expect(result).toEqual(loginResponse);
    });

    it('should throw error when neither username nor email is provided', async () => {
      const dto = { password: 'Admin@123' } as any;

      await expect(controller.login(dto)).rejects.toThrow(
        'Username or email is required',
      );
      expect(mockCommandBus.execute).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should call CommandBus.execute with RefreshTokenCommand', async () => {
      const loginResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      mockCommandBus.execute.mockResolvedValue(loginResponse);

      const dto = { refreshToken: 'old-refresh-token' };
      const result = await controller.refresh(dto);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new RefreshTokenCommand('old-refresh-token'),
      );
      expect(result).toEqual(loginResponse);
    });
  });

  describe('logout', () => {
    it('should call CommandBus.execute with LogoutCommand', async () => {
      mockCommandBus.execute.mockResolvedValue(undefined);

      const user = { sub: 1, email: 'admin@test.com', username: 'admin', role: 'Admin' };
      const dto = { refreshToken: 'refresh-token' };

      await controller.logout(user, dto);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new LogoutCommand(1, 'refresh-token'),
      );
    });

    it('should call CommandBus.execute with LogoutCommand without refreshToken', async () => {
      mockCommandBus.execute.mockResolvedValue(undefined);

      const user = { sub: 1, email: 'admin@test.com', username: 'admin', role: 'Admin' };

      await controller.logout(user);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new LogoutCommand(1, undefined),
      );
    });
  });

  describe('me', () => {
    it('should call QueryBus.execute with GetCurrentUserQuery', async () => {
      const userInfo = {
        id: 1,
        email: 'admin@test.com',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        role: 'Admin',
      };
      mockQueryBus.execute.mockResolvedValue(userInfo);

      const user = { sub: 1, email: 'admin@test.com', username: 'admin', role: 'Admin' };
      const result = await controller.me(user);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new GetCurrentUserQuery(1),
      );
      expect(result).toEqual(userInfo);
    });
  });
});
