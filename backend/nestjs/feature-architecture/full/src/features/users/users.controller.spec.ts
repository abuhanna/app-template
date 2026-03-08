import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UserService } from './user.service';
import { UserResponseDto } from './dtos/user.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Reflector } from '@nestjs/core';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UserService;

  const mockUserResponse: UserResponseDto = {
    id: 1,
    username: 'johndoe',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    role: 'user',
    departmentId: null,
    departmentName: null,
    isActive: true,
    lastLoginAt: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: null,
  };

  const mockPaginatedResult = {
    data: [mockUserResponse],
    pagination: {
      page: 1,
      pageSize: 10,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    },
  };

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UserService, useValue: mockService },
        { provide: Reflector, useValue: new Reflector() },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a paginated list of users', async () => {
      mockService.findAll.mockResolvedValue(mockPaginatedResult);
      const query = new PaginationQueryDto();

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query, undefined, undefined);
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      mockService.findById.mockResolvedValue(mockUserResponse);

      const result = await controller.findById(1);

      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createDto = { username: 'janedoe', email: 'jane@example.com', password: 'password123' };
      mockService.create.mockResolvedValue(mockUserResponse);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const updateDto = { firstName: 'Updated', email: 'updated@example.com' };
      const updatedUser = { ...mockUserResponse, firstName: 'Updated', email: 'updated@example.com' };
      mockService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('delete', () => {
    it('should delete a user by id', async () => {
      mockService.delete.mockResolvedValue(undefined);

      await controller.delete(1);

      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });
});
