import { Test, TestingModule } from '@nestjs/testing';
import { StreamableFile } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

describe('FilesController', () => {
  let controller: FilesController;
  let filesService: FilesService;

  const mockUploadedFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test-document.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('file-content'),
    size: 1024,
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  };

  const mockSavedFile = {
    id: 1,
    fileName: 'test-document.pdf',
    storedFileName: '1700000000000-test-document.pdf',
    contentType: 'application/pdf',
    fileSize: 1024,
    filePath: './uploads/1700000000000-test-document.pdf',
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: {
            saveFile: jest.fn().mockResolvedValue(mockSavedFile),
            getFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    filesService = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should save the uploaded file and return the record', async () => {
      const result = await controller.uploadFile(mockUploadedFile);

      expect(filesService.saveFile).toHaveBeenCalledWith(mockUploadedFile);
      expect(result).toEqual(mockSavedFile);
    });
  });

  describe('downloadFile', () => {
    it('should return file with correct headers', async () => {
      const mockStreamableFile = new StreamableFile(Buffer.from('file-content'));
      (filesService.getFile as jest.Mock).mockResolvedValue({
        file: mockStreamableFile,
        contentType: 'application/pdf',
        fileName: 'test-document.pdf',
      });

      const mockResponse = {
        set: jest.fn(),
      };

      const result = await controller.downloadFile('1', mockResponse as any);

      expect(filesService.getFile).toHaveBeenCalledWith(1);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test-document.pdf"',
      });
      expect(result).toBe(mockStreamableFile);
    });
  });
});
