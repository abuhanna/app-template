import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { AuditLogsController } from './audit-logs.controller';
import { GetAuditLogsQuery } from '../application/queries/get-audit-logs.query';

describe('AuditLogsController', () => {
  let controller: AuditLogsController;
  let queryBus: QueryBus;

  const mockQueryBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogsController],
      providers: [
        { provide: QueryBus, useValue: mockQueryBus },
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
          { id: 1, entityName: 'User', entityId: '1', action: 'CREATE', timestamp: new Date() },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      };
      mockQueryBus.execute.mockResolvedValue(pagedResult);

      const queryDto = {
        page: 1,
        pageSize: 20,
        sortDir: 'desc' as const,
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
        userId: 1,
        action: 'UPDATE',
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        page: 2,
        pageSize: 10,
        sortBy: 'timestamp',
        sortDir: 'asc' as const,
        search: 'admin',
      };
      const result = await controller.getAuditLogs(queryDto as any);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new GetAuditLogsQuery(
          'User',
          '5',
          1,
          'UPDATE',
          new Date('2024-01-01'),
          new Date('2024-12-31'),
          2,
          10,
          'timestamp',
          'asc',
          'admin',
        ),
      );
      expect(result).toEqual(pagedResult);
    });
  });
});
