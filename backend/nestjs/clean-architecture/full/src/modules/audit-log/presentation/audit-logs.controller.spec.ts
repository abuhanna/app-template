import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { AuditLogsController } from './audit-logs.controller';
import { GetAuditLogsQuery } from '../application/queries/get-audit-logs.query';
import { IAuditLogRepository } from '../domain/interfaces/audit-log.repository.interface';

describe('AuditLogsController', () => {
  let controller: AuditLogsController;
  let queryBus: QueryBus;

  const mockQueryBus = {
    execute: jest.fn(),
  };

  const mockAuditLogRepository = {
    findById: jest.fn(),
    findByFilters: jest.fn(),
    findByFiltersPaginated: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogsController],
      providers: [
        { provide: QueryBus, useValue: mockQueryBus },
        { provide: IAuditLogRepository, useValue: mockAuditLogRepository },
      ],
    }).compile();

    controller = module.get<AuditLogsController>(AuditLogsController);
    queryBus = module.get<QueryBus>(QueryBus);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAuditLogs', () => {
    it('should call QueryBus.execute with GetAuditLogsQuery and basic pagination', async () => {
      const pagedResult = {
        items: [
          { id: 1, entityName: 'User', entityId: '1', action: 'CREATE', createdAt: new Date() },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      };
      mockQueryBus.execute.mockResolvedValue(pagedResult);

      const queryDto = {
        page: 1,
        pageSize: 20,
        sortOrder: 'desc' as const,
      };
      const result = await controller.getAuditLogs(queryDto as any);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(expect.any(GetAuditLogsQuery));
      expect(result).toEqual(pagedResult);
    });

    it('should pass filter parameters to GetAuditLogsQuery', async () => {
      const pagedResult = { items: [], total: 0, page: 1, pageSize: 20 };
      mockQueryBus.execute.mockResolvedValue(pagedResult);

      const queryDto = {
        entityName: 'User',
        entityId: '5',
        userId: '1',
        action: 'UPDATE',
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        page: 2,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'asc' as const,
        search: 'admin',
      };
      const result = await controller.getAuditLogs(queryDto as any);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new GetAuditLogsQuery(
          'User',
          '5',
          '1',
          'UPDATE',
          new Date('2024-01-01'),
          new Date('2024-12-31'),
          2,
          10,
          'createdAt',
          'asc',
          'admin',
        ),
      );
      expect(result).toEqual(pagedResult);
    });
  });

  describe('getAuditLogById', () => {
    it('should return audit log when found', async () => {
      const log = {
        id: 1,
        action: 'CREATE',
        entityName: 'User',
        entityId: '1',
        userId: 1,
        userName: 'admin',
        details: 'Created user',
        ipAddress: '127.0.0.1',
        createdAt: new Date('2024-01-01'),
      };
      mockAuditLogRepository.findById.mockResolvedValue(log);

      const result = await controller.getAuditLogById(1);

      expect(mockAuditLogRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: 1,
        action: 'CREATE',
        entityName: 'User',
        entityId: '1',
        userId: '1',
        userName: 'admin',
        details: 'Created user',
        ipAddress: '127.0.0.1',
        createdAt: new Date('2024-01-01'),
      });
    });

    it('should throw NotFoundException when audit log not found', async () => {
      mockAuditLogRepository.findById.mockResolvedValue(null);

      await expect(controller.getAuditLogById(999)).rejects.toThrow(NotFoundException);
    });
  });
});
