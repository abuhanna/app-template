import { Test, TestingModule } from '@nestjs/testing';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';

describe('ExportController', () => {
  let controller: ExportController;
  let exportService: ExportService;

  const mockExportService = {
    exportUsers: jest.fn(),
    exportDepartments: jest.fn(),
    exportAuditLogs: jest.fn(),
    exportNotifications: jest.fn(),
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
      ],
    }).compile();

    controller = module.get<ExportController>(ExportController);
    exportService = module.get<ExportService>(ExportService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('exportUsers', () => {
    it('should export users and send response', async () => {
      const exportResult = {
        buffer: Buffer.from('data'),
        contentType: 'text/csv',
        fileName: 'users_20240101.csv',
      };
      mockExportService.exportUsers.mockResolvedValue(exportResult);

      await controller.exportUsers('csv', undefined, undefined, undefined, mockResponse);

      expect(exportService.exportUsers).toHaveBeenCalledWith('csv', undefined, undefined, undefined);
      expect(mockResponse.set).toHaveBeenCalled();
      expect(mockResponse.end).toHaveBeenCalledWith(exportResult.buffer);
    });
  });

  describe('exportDepartments', () => {
    it('should export departments and send response', async () => {
      const exportResult = {
        buffer: Buffer.from('data'),
        contentType: 'text/csv',
        fileName: 'departments_20240101.csv',
      };
      mockExportService.exportDepartments.mockResolvedValue(exportResult);

      await controller.exportDepartments('csv', undefined, undefined, mockResponse);

      expect(exportService.exportDepartments).toHaveBeenCalledWith('csv', undefined, undefined);
      expect(mockResponse.end).toHaveBeenCalledWith(exportResult.buffer);
    });
  });
});
