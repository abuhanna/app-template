import { Test, TestingModule } from '@nestjs/testing';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { UserService } from '../../services/user.service';
import { DepartmentsService } from '../../services/departments.service';
import { AuditLogsService } from '../../services/audit-logs.service';
import { NotificationsService } from '../../services/notifications.service';

describe('ExportController', () => {
  let controller: ExportController;

  const mockExportService = {
    exportData: jest.fn(),
    getContentType: jest.fn(),
    getExtension: jest.fn(),
  };

  const mockUserService = {
    findAllPaginated: jest.fn(),
  };

  const mockDepartmentsService = {
    findAllPaginated: jest.fn(),
  };

  const mockAuditLogsService = {
    findAll: jest.fn(),
  };

  const mockNotificationsService = {
    findAllByUser: jest.fn(),
  };

  const mockResponse = {
    set: jest.fn(),
    end: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExportController],
      providers: [
        { provide: ExportService, useValue: mockExportService },
        { provide: UserService, useValue: mockUserService },
        { provide: DepartmentsService, useValue: mockDepartmentsService },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    controller = module.get<ExportController>(ExportController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('exportUsers', () => {
    it('should export users as CSV', async () => {
      const users = { data: [{ id: 1, username: 'johndoe' }], pagination: {} };
      mockUserService.findAllPaginated.mockResolvedValue(users);
      const csvBuffer = Buffer.from('id,username\n1,johndoe');
      mockExportService.exportData.mockResolvedValue(csvBuffer);
      mockExportService.getContentType.mockReturnValue('text/csv');
      mockExportService.getExtension.mockReturnValue('csv');

      await controller.exportUsers(mockResponse, 'csv');

      expect(mockUserService.findAllPaginated).toHaveBeenCalled();
      expect(mockExportService.exportData).toHaveBeenCalledWith(users.data, 'csv');
      expect(mockResponse.set).toHaveBeenCalled();
      expect(mockResponse.end).toHaveBeenCalledWith(csvBuffer);
    });
  });
});
