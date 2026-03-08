import { Test, TestingModule } from '@nestjs/testing';
import { StreamableFile } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

describe('FilesController', () => {
  let controller: FilesController;
  let service: FilesService;

  const mockService = {
    findAll: jest.fn(),
    saveFile: jest.fn(),
    getFileMetadata: jest.fn(),
    getFileForDownload: jest.fn(),
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
        fileName: 'uuid_test.pdf',
        originalFileName: 'test.pdf',
        contentType: 'application/pdf',
        fileSize: 1024,
        downloadUrl: '/api/files/1/download',
      };
      mockService.saveFile.mockResolvedValue(savedFile);

      const result = await controller.uploadFile(mockFile, { user: { userId: 1 } });

      expect(service.saveFile).toHaveBeenCalled();
      expect(result).toEqual(savedFile);
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
      mockService.getFileForDownload.mockResolvedValue(fileResult);

      const mockResponse = {
        set: jest.fn(),
      } as any;

      const result = await controller.downloadFile(1, mockResponse, { user: null });

      expect(service.getFileForDownload).toHaveBeenCalledWith(1, false);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test.pdf"',
      });
      expect(result).toEqual(mockStreamableFile);
    });
  });
});
