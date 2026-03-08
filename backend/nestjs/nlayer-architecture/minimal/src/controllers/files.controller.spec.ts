import { Test, TestingModule } from '@nestjs/testing';
import { StreamableFile } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from '../services/files.service';

describe('FilesController', () => {
  let controller: FilesController;
  let service: FilesService;

  const mockService = {
    saveFile: jest.fn(),
    findAllPaginated: jest.fn(),
    findOne: jest.fn(),
    getFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        { provide: FilesService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    service = module.get<FilesService>(FilesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should save and return the uploaded file record', async () => {
      const mockFile = {
        buffer: Buffer.from('test content'),
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      } as any;

      const savedFile = {
        id: 1,
        fileName: '1234567890-test.pdf',
        originalFileName: 'test.pdf',
        contentType: 'application/pdf',
        fileSize: 1024,
      };
      mockService.saveFile.mockResolvedValue(savedFile);

      const mockReq = { user: { userId: 1 } };
      const result = await controller.uploadFile(mockFile, mockReq);

      expect(service.saveFile).toHaveBeenCalledWith(mockFile, '1', undefined, undefined, false);
      expect(result).toEqual(savedFile);
    });
  });

  describe('listFiles', () => {
    it('should return paginated list of files', async () => {
      const paginatedResult = {
        data: [{ id: 1, fileName: 'test.pdf' }],
        pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1, hasNext: false, hasPrevious: false },
      };
      mockService.findAllPaginated.mockResolvedValue(paginatedResult);

      const query = { page: 1, pageSize: 10 } as any;
      const result = await controller.listFiles(query);

      expect(service.findAllPaginated).toHaveBeenCalled();
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('downloadFile', () => {
    it('should set response headers and return the file stream', async () => {
      const mockStreamableFile = new StreamableFile(Buffer.from('file content'));
      const fileResult = {
        file: mockStreamableFile,
        contentType: 'application/pdf',
        fileName: 'test.pdf',
      };
      mockService.getFile.mockResolvedValue(fileResult);

      const mockResponse = { set: jest.fn() } as any;

      const result = await controller.downloadFile(1, mockResponse);

      expect(service.getFile).toHaveBeenCalledWith(1);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test.pdf"',
      });
      expect(result).toEqual(mockStreamableFile);
    });
  });
});
