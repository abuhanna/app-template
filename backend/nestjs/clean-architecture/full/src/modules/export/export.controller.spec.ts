import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { UserOrmEntity } from '../user-management/infrastructure/persistence/user.orm-entity';
import { DepartmentOrmEntity } from '../department-management/infrastructure/persistence/department.orm-entity';
import { AuditLogOrmEntity } from '../audit-log/infrastructure/persistence/audit-log.orm-entity';

describe('ExportController', () => {
  let controller: ExportController;
  let exportService: ExportService;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  };

  const mockUserRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockDepartmentRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockAuditLogRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockExportService = {
    exportToCsv: jest.fn(),
    exportToExcel: jest.fn(),
    exportToPdf: jest.fn(),
  };

  const mockResponse = {
    set: jest.fn(),
    send: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExportController],
      providers: [
        { provide: ExportService, useValue: mockExportService },
        { provide: getRepositoryToken(UserOrmEntity), useValue: mockUserRepository },
        { provide: getRepositoryToken(DepartmentOrmEntity), useValue: mockDepartmentRepository },
        { provide: getRepositoryToken(AuditLogOrmEntity), useValue: mockAuditLogRepository },
      ],
    }).compile();

    controller = module.get<ExportController>(ExportController);
    exportService = module.get<ExportService>(ExportService);

    jest.clearAllMocks();

    // Reset query builder mocks
    mockQueryBuilder.leftJoinAndSelect.mockReturnThis();
    mockQueryBuilder.andWhere.mockReturnThis();
    mockQueryBuilder.orderBy.mockReturnThis();
    mockQueryBuilder.take.mockReturnThis();
    mockQueryBuilder.getMany.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('exportUsers', () => {
    it('should export users to xlsx by default and send response', async () => {
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const exportResult = {
        buffer: Buffer.from('xlsx-data'),
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileName: 'users_20240101.xlsx',
      };
      mockExportService.exportToExcel.mockResolvedValue(exportResult);

      await controller.exportUsers(mockResponse, 'xlsx');

      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockExportService.exportToExcel).toHaveBeenCalled();
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': exportResult.contentType,
        'Content-Disposition': `attachment; filename="${exportResult.fileName}"`,
      });
      expect(mockResponse.send).toHaveBeenCalledWith(exportResult.buffer);
    });

    it('should export users to csv format', async () => {
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const exportResult = {
        buffer: Buffer.from('csv-data'),
        contentType: 'text/csv',
        fileName: 'users_20240101.csv',
      };
      mockExportService.exportToCsv.mockResolvedValue(exportResult);

      await controller.exportUsers(mockResponse, 'csv');

      expect(mockExportService.exportToCsv).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalledWith(exportResult.buffer);
    });
  });

  describe('exportDepartments', () => {
    it('should export departments and send response', async () => {
      mockDepartmentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const exportResult = {
        buffer: Buffer.from('xlsx-data'),
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileName: 'departments_20240101.xlsx',
      };
      mockExportService.exportToExcel.mockResolvedValue(exportResult);

      await controller.exportDepartments(mockResponse, 'xlsx');

      expect(mockDepartmentRepository.createQueryBuilder).toHaveBeenCalledWith('department');
      expect(mockExportService.exportToExcel).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalledWith(exportResult.buffer);
    });
  });
});
