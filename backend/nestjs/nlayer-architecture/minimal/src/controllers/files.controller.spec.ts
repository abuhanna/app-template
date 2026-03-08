import { Test, TestingModule } from '@nestjs/testing';
import { StreamableFile } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from '../services/files.service';

describe('FilesController', () => {
  let controller: FilesController;
  let service: FilesService;

  const mockService = {
    saveFile: jest.fn(),
    listFiles: jest.fn(),
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
        fileName: 'test.pdf',
        storedFileName: '1234567890-test.pdf',
        contentType: 'application/pdf',
        fileSize: 1024,
        filePath: './uploads/1234567890-test.pdf',
      };
      mockService.saveFile.mockResolvedValue(savedFile);

      const result = await controller.uploadFile(mockFile);

      expect(service.saveFile).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual(savedFile);
    });
  });

  describe('listFiles', () => {
    it('should return list of files', async () => {
      const files = [{ id: 1, fileName: 'test.pdf' }];
      mockService.listFiles.mockResolvedValue(files);

      const result = await controller.listFiles();

      expect(service.listFiles).toHaveBeenCalled();
      expect(result).toEqual(files);
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
