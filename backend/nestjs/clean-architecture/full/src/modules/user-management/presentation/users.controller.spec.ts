import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { GetUsersQuery, GetUserByIdQuery } from '../application/queries';
import {
  CreateUserCommand,
  UpdateUserCommand,
  DeleteUserCommand,
  ChangePasswordCommand,
} from '../application/commands';
import { UserRole } from '../domain/value-objects/user-role';

describe('UsersController', () => {
  let controller: UsersController;
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
      controllers: [UsersController],
      providers: [
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: QueryBus, useValue: mockQueryBus },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call QueryBus.execute with GetUsersQuery', async () => {
      const pagedResult = {
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      };
      mockQueryBus.execute.mockResolvedValue(pagedResult);

      const queryDto = { page: 1, pageSize: 10 };
      const result = await controller.findAll(queryDto);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(GetUsersQuery),
      );
      expect(result).toEqual(pagedResult);
    });

    it('should pass pagination and search params to GetUsersQuery', async () => {
      mockQueryBus.execute.mockResolvedValue({ items: [], totalCount: 0 });

      const queryDto = {
        page: 2,
        pageSize: 25,
        sortBy: 'username',
        sortOrder: 'desc' as const,
        search: 'admin',
      };
      await controller.findAll(queryDto);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new GetUsersQuery(2, 25, 'username', 'desc', 'admin'),
      );
    });
  });

  describe('findOne', () => {
    it('should call QueryBus.execute with GetUserByIdQuery', async () => {
      const userDto = {
        id: 1,
        email: 'admin@test.com',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        role: 'Admin',
      };
      mockQueryBus.execute.mockResolvedValue(userDto);

      const result = await controller.findOne(1);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new GetUserByIdQuery(1),
      );
      expect(result).toEqual(userDto);
    });
  });

  describe('create', () => {
    it('should call CommandBus.execute with CreateUserCommand', async () => {
      const createdUser = {
        id: 2,
        email: 'new@test.com',
        username: 'newuser',
        firstName: 'New',
        lastName: 'User',
        role: 'User',
      };
      mockCommandBus.execute.mockResolvedValue(createdUser);

      const dto = {
        email: 'new@test.com',
        username: 'newuser',
        password: 'Password@123',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.User,
        departmentId: 1,
      };
      const result = await controller.create(dto);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new CreateUserCommand(
          'new@test.com',
          'newuser',
          'Password@123',
          'New',
          'User',
          UserRole.User,
          1,
        ),
      );
      expect(result).toEqual(createdUser);
    });
  });

  describe('update', () => {
    it('should call CommandBus.execute with UpdateUserCommand', async () => {
      const updatedUser = {
        id: 1,
        email: 'updated@test.com',
        username: 'admin',
        firstName: 'Updated',
        lastName: 'Admin',
        role: 'Admin',
      };
      mockCommandBus.execute.mockResolvedValue(updatedUser);

      const dto = {
        email: 'updated@test.com',
        username: 'admin',
        firstName: 'Updated',
        lastName: 'Admin',
        role: UserRole.Admin,
        departmentId: 1,
        isActive: true,
      };
      const result = await controller.update(1, dto);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new UpdateUserCommand(
          1,
          'updated@test.com',
          'admin',
          'Updated',
          'Admin',
          UserRole.Admin,
          1,
          true,
        ),
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('delete', () => {
    it('should call CommandBus.execute with DeleteUserCommand', async () => {
      mockCommandBus.execute.mockResolvedValue(undefined);

      await controller.delete(1);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new DeleteUserCommand(1),
      );
    });
  });

  describe('changePassword', () => {
    it('should call CommandBus.execute with ChangePasswordCommand', async () => {
      mockCommandBus.execute.mockResolvedValue(undefined);

      const user = { sub: 1, email: 'admin@test.com', username: 'admin', role: 'Admin' };
      const dto = {
        currentPassword: 'OldPassword@123',
        newPassword: 'NewPassword@123',
        confirmPassword: 'NewPassword@123',
      };
      const result = await controller.changePassword(user, dto);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new ChangePasswordCommand(1, 'OldPassword@123', 'NewPassword@123'),
      );
      expect(result).toEqual({ message: 'Password changed successfully' });
    });

    it('should throw BadRequestException when passwords do not match', async () => {
      const user = { sub: 1, email: 'admin@test.com', username: 'admin', role: 'Admin' };
      const dto = {
        currentPassword: 'OldPassword@123',
        newPassword: 'NewPassword@123',
        confirmPassword: 'DifferentPassword@123',
      };

      await expect(controller.changePassword(user, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockCommandBus.execute).not.toHaveBeenCalled();
    });
  });
});
