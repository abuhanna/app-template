import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DepartmentsController } from './departments.controller';
import {
  CreateDepartmentCommand,
  UpdateDepartmentCommand,
  DeleteDepartmentCommand,
} from '../application/commands';
import { GetDepartmentsQuery, GetDepartmentByIdQuery } from '../application/queries';

describe('DepartmentsController', () => {
  let controller: DepartmentsController;
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
      controllers: [DepartmentsController],
      providers: [
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: QueryBus, useValue: mockQueryBus },
      ],
    }).compile();

    controller = module.get<DepartmentsController>(DepartmentsController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call QueryBus.execute with GetDepartmentsQuery', async () => {
      const pagedResult = {
        items: [{ id: 1, name: 'IT', code: 'IT' }],
        total: 1,
        page: 1,
        pageSize: 10,
      };
      mockQueryBus.execute.mockResolvedValue(pagedResult);

      const queryDto = { page: 1, pageSize: 10, sortBy: 'name', sortOrder: 'asc' as const, search: '' };
      const result = await controller.findAll(queryDto);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new GetDepartmentsQuery(1, 10, 'name', 'asc', ''),
      );
      expect(result).toEqual(pagedResult);
    });
  });

  describe('findOne', () => {
    it('should call QueryBus.execute with GetDepartmentByIdQuery', async () => {
      const department = { id: 1, name: 'IT', code: 'IT', description: 'IT Department' };
      mockQueryBus.execute.mockResolvedValue(department);

      const result = await controller.findOne(1);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new GetDepartmentByIdQuery(1),
      );
      expect(result).toEqual(department);
    });
  });

  describe('create', () => {
    it('should call CommandBus.execute with CreateDepartmentCommand', async () => {
      const department = { id: 1, name: 'HR', code: 'HR', description: 'Human Resources' };
      mockCommandBus.execute.mockResolvedValue(department);

      const dto = { name: 'HR', code: 'HR', description: 'Human Resources' };
      const result = await controller.create(dto);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new CreateDepartmentCommand('HR', 'HR', 'Human Resources'),
      );
      expect(result).toEqual(department);
    });
  });

  describe('update', () => {
    it('should call CommandBus.execute with UpdateDepartmentCommand', async () => {
      const updated = { id: 1, name: 'HR Updated', code: 'HR', description: 'Updated', isActive: true };
      mockCommandBus.execute.mockResolvedValue(updated);

      const dto = { name: 'HR Updated', code: 'HR', description: 'Updated', isActive: true };
      const result = await controller.update(1, dto);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new UpdateDepartmentCommand(1, 'HR Updated', 'HR', 'Updated', true),
      );
      expect(result).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('should call CommandBus.execute with DeleteDepartmentCommand', async () => {
      mockCommandBus.execute.mockResolvedValue(undefined);

      await controller.delete(1);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new DeleteDepartmentCommand(1),
      );
    });
  });
});
