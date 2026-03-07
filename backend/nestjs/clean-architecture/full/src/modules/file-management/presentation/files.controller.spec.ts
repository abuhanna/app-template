import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FilesController } from './files.controller';
import { UploadFileCommand, DeleteFileCommand } from '../application/commands';
import { GetFilesQuery, GetFileByIdQuery, DownloadFileQuery } from '../application/queries';

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
        items: [{ id: 1, originalFileName: 'test.pdf', contentType: 'application/pdf' }],
        total: 1,
        page: 1,
        pageSize: 10,
      };
      mockQueryBus.execute.mockResolvedValue(paginatedResult);

      const result = await controller.findAll('documents', 'true', '1', '10');

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new GetFilesQuery('documents', true, 1, 10),
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should handle undefined query parameters', async () => {
      const paginatedResult = { items: [], total: 0, page: 1, pageSize: 10 };
      mockQueryBus.execute.mockResolvedValue(paginatedResult);

      const result = await controller.findAll();

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new GetFilesQuery(undefined, undefined, undefined, undefined),
      );
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should call QueryBus.execute with GetFileByIdQuery', async () => {
      const file = { id: 1, originalFileName: 'test.pdf', contentType: 'application/pdf' };
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
        buffer: Buffer.from('test content'),
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
