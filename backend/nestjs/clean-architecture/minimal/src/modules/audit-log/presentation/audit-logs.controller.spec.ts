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
    it('should call QueryBus.execute with GetAuditLogsQuery using default pagination', async () => {
      const pagedResult = {
        data: [
          {
            id: 1,
            entityName: 'User',
            entityId: '1',
            action: 'UPDATE',
            oldValues: null,
            newValues: '{"name":"updated"}',
            details: 'name',
            userId: '1',
            createdAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };
      mockQueryBus.execute.mockResolvedValue(pagedResult);

      const queryDto = {
        page: 1,
        pageSize: 20,
        sortOrder: 'desc' as const,
      };
      const result = await controller.getAuditLogs(queryDto);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(GetAuditLogsQuery),
      );
      expect(result).toEqual(pagedResult);
    });

    it('should pass all filter parameters to GetAuditLogsQuery', async () => {
      const pagedResult = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      };
      mockQueryBus.execute.mockResolvedValue(pagedResult);

      const queryDto = {
        entityName: 'User',
        entityId: '42',
        userId: '1',
        action: 'UPDATE',
        fromDate: '2024-01-01T00:00:00.000Z',
        toDate: '2024-12-31T23:59:59.000Z',
        page: 2,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'asc' as const,
        search: 'admin',
      };
      const result = await controller.getAuditLogs(queryDto);

      const executedQuery = mockQueryBus.execute.mock.calls[0][0] as GetAuditLogsQuery;
      expect(executedQuery.entityName).toBe('User');
      expect(executedQuery.entityId).toBe('42');
      expect(executedQuery.userId).toBe('1');
      expect(executedQuery.action).toBe('UPDATE');
      expect(executedQuery.fromDate).toEqual(new Date('2024-01-01T00:00:00.000Z'));
      expect(executedQuery.toDate).toEqual(new Date('2024-12-31T23:59:59.000Z'));
      expect(executedQuery.page).toBe(2);
      expect(executedQuery.pageSize).toBe(10);
      expect(executedQuery.sortBy).toBe('createdAt');
      expect(executedQuery.sortOrder).toBe('asc');
      expect(executedQuery.search).toBe('admin');
      expect(result).toEqual(pagedResult);
    });

    it('should handle query with no filters', async () => {
      const pagedResult = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      };
      mockQueryBus.execute.mockResolvedValue(pagedResult);

      const queryDto = {
        page: 1,
        pageSize: 20,
        sortOrder: 'desc' as const,
      };
      const result = await controller.getAuditLogs(queryDto);

      const executedQuery = mockQueryBus.execute.mock.calls[0][0] as GetAuditLogsQuery;
      expect(executedQuery.entityName).toBeUndefined();
      expect(executedQuery.entityId).toBeUndefined();
      expect(executedQuery.userId).toBeUndefined();
      expect(executedQuery.action).toBeUndefined();
      expect(executedQuery.fromDate).toBeUndefined();
      expect(executedQuery.toDate).toBeUndefined();
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
        userId: '1',
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
        entityType: 'User',
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
