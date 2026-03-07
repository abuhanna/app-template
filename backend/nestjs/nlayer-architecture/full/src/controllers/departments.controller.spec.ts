import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from '../services/departments.service';

describe('DepartmentsController', () => {
  let controller: DepartmentsController;
  let service: DepartmentsService;

  const mockDepartment = { id: 1, name: 'IT', code: 'IT', description: 'IT Department', isActive: true };

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [
        { provide: DepartmentsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<DepartmentsController>(DepartmentsController);
    service = module.get<DepartmentsService>(DepartmentsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of departments', async () => {
      const departments = [mockDepartment];
      mockService.findAll.mockResolvedValue(departments);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(departments);
    });

    it('should return an empty array when no departments exist', async () => {
      mockService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a department by id', async () => {
      mockService.findOne.mockResolvedValue(mockDepartment);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockDepartment);
    });
  });

  describe('create', () => {
    it('should create and return a new department', async () => {
      const createDto = { name: 'HR', code: 'HR', description: 'Human Resources' };
      const created = { id: 2, ...createDto, isActive: true };
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

      const result = await controller.update('1', updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should remove a department by id', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
