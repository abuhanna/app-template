import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FilesController } from './files.controller';
import { UploadFileCommand, DeleteFileCommand } from '../application/commands';
import { GetFilesQuery, GetFileByIdQuery, DownloadFileQuery } from '../application/queries';
import { Readable } from 'stream';

describe('FilesController', () => {
  let controller: FilesController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  const mockCommandBus = {
    execute: jest.fn(),
  };

  const mockQueryBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: QueryBus, useValue: mockQueryBus },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call QueryBus.execute with GetFilesQuery', async () => {
      const paginatedResult = {
        data: [
          {
            id: 1,
            originalFileName: 'test.pdf',
            contentType: 'application/pdf',
            fileSize: 1024,
            category: 'documents',
            isPublic: false,
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };
      mockQueryBus.execute.mockResolvedValue(paginatedResult);

      const result = await controller.findAll();

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new GetFilesQuery(undefined, undefined, undefined, undefined),
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should pass filter parameters to GetFilesQuery', async () => {
      const paginatedResult = {
        data: [],
        total: 0,
        page: 2,
        pageSize: 10,
        totalPages: 0,
      };
      mockQueryBus.execute.mockResolvedValue(paginatedResult);

      const result = await controller.findAll('documents', 'true', '2', '10');

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new GetFilesQuery('documents', true, 2, 10),
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should handle isPublic=false correctly', async () => {
      const paginatedResult = { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
      mockQueryBus.execute.mockResolvedValue(paginatedResult);

      await controller.findAll(undefined, 'false');

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new GetFilesQuery(undefined, false, undefined, undefined),
      );
    });
  });

  describe('findOne', () => {
    it('should call QueryBus.execute with GetFileByIdQuery', async () => {
      const file = {
        id: 1,
        originalFileName: 'test.pdf',
        contentType: 'application/pdf',
        fileSize: 1024,
      };
      mockQueryBus.execute.mockResolvedValue(file);

      const result = await controller.findOne(1);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new GetFileByIdQuery(1),
      );
      expect(result).toEqual(file);
    });
  });

  describe('upload', () => {
    it('should call CommandBus.execute with UploadFileCommand', async () => {
      const uploadedFile = {
        id: 1,
        originalFileName: 'test.pdf',
        contentType: 'application/pdf',
        fileSize: 1024,
      };
      mockCommandBus.execute.mockResolvedValue(uploadedFile);

      const file = {
        buffer: Buffer.from('test file content'),
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      } as Express.Multer.File;

      const result = await controller.upload(file, 'A test file', 'documents', 'true');

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new UploadFileCommand(
          file.buffer,
          'test.pdf',
          'application/pdf',
          1024,
          'A test file',
          'documents',
          true,
        ),
      );
      expect(result).toEqual(uploadedFile);
    });

    it('should handle upload without optional parameters', async () => {
      const uploadedFile = {
        id: 2,
        originalFileName: 'image.png',
        contentType: 'image/png',
        fileSize: 2048,
      };
      mockCommandBus.execute.mockResolvedValue(uploadedFile);

      const file = {
        buffer: Buffer.from('image content'),
        originalname: 'image.png',
        mimetype: 'image/png',
        size: 2048,
      } as Express.Multer.File;

      const result = await controller.upload(file);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new UploadFileCommand(
          file.buffer,
          'image.png',
          'image/png',
          2048,
          undefined,
          undefined,
          false,
        ),
      );
      expect(result).toEqual(uploadedFile);
    });
  });

  describe('download', () => {
    it('should pipe file stream to response', async () => {
      const mockStream = new Readable({
        read() {
          this.push('file content');
          this.push(null);
        },
      });

      const downloadResult = {
        stream: mockStream,
        contentType: 'application/pdf',
        fileName: 'test.pdf',
      };
      mockQueryBus.execute.mockResolvedValue(downloadResult);

      const mockResponse = {
        setHeader: jest.fn(),
      } as any;

      // Mock pipe on the stream
      mockStream.pipe = jest.fn();

      await controller.download(1, mockResponse);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new DownloadFileQuery(1),
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/pdf',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="test.pdf"',
      );
      expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call CommandBus.execute with DeleteFileCommand', async () => {
      mockCommandBus.execute.mockResolvedValue(undefined);

      await controller.delete(1);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new DeleteFileCommand(1),
      );
    });
  });
});
