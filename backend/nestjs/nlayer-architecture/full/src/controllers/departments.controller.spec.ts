import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from '../services/departments.service';

describe('DepartmentsController', () => {
  let controller: DepartmentsController;
  let service: DepartmentsService;

  const mockDepartment = {
    id: 1,
    code: 'IT',
    name: 'IT Department',
    description: 'IT Department',
    isActive: true,
    userCount: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: null,
  };

  const mockService = {
    findAllPaginated: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [{ provide: DepartmentsService, useValue: mockService }],
    }).compile();

    controller = module.get<DepartmentsController>(DepartmentsController);
    service = module.get<DepartmentsService>(DepartmentsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated departments', async () => {
      const paginated = {
        data: [mockDepartment],
        pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1, hasNext: false, hasPrevious: false },
      };
      mockService.findAllPaginated.mockResolvedValue(paginated);

      const result = await controller.findAll({ page: 1, pageSize: 10, sortOrder: 'desc' as const });

      expect(result).toEqual(paginated);
    });
  });

  describe('findOne', () => {
    it('should return a department by id', async () => {
      mockService.findOne.mockResolvedValue(mockDepartment);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockDepartment);
    });
  });

  describe('create', () => {
    it('should create and return a new department', async () => {
      const createDto = { code: 'HR', name: 'Human Resources' };
      const created = { id: 2, ...createDto, description: null, isActive: true, userCount: 0 };
      mockService.create.mockResolvedValue(created);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should update and return the department', async () => {
      const updateDto = { name: 'IT Updated' };
      const updated = { ...mockDepartment, name: 'IT Updated' };
      mockService.update.mockResolvedValue(updated);

      const result = await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should remove a department by id', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
