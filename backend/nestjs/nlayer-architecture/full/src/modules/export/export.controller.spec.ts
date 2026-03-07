import { Test, TestingModule } from '@nestjs/testing';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';

describe('ExportController', () => {
  let controller: ExportController;
  let exportService: ExportService;

  const mockExportService = {
    exportToCsv: jest.fn(),
    exportToExcel: jest.fn(),
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

  describe('exportCsv', () => {
    it('should export data as CSV and send response', async () => {
      const data = [{ name: 'John', email: 'john@example.com' }];
      const csvBuffer = Buffer.from('name,email\nJohn,john@example.com');
      mockExportService.exportToCsv.mockResolvedValue(csvBuffer);

      await controller.exportCsv(data, mockResponse);

      expect(exportService.exportToCsv).toHaveBeenCalledWith(data);
      expect(mockResponse.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Type': 'text/csv',
          'Content-Length': csvBuffer.length,
        }),
      );
      expect(mockResponse.end).toHaveBeenCalledWith(csvBuffer);
    });
  });

  describe('exportExcel', () => {
    it('should export data as Excel and send response', async () => {
      const data = [{ name: 'John', email: 'john@example.com' }];
      const excelBuffer = Buffer.from('excel-binary-data');
      mockExportService.exportToExcel.mockResolvedValue(excelBuffer);

      await controller.exportExcel(data, mockResponse);

      expect(exportService.exportToExcel).toHaveBeenCalledWith(data);
      expect(mockResponse.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Length': excelBuffer.length,
        }),
      );
      expect(mockResponse.end).toHaveBeenCalledWith(excelBuffer);
    });
  });
});
