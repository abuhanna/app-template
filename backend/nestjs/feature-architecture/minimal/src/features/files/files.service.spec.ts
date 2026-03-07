import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as fs from 'fs';
import { FilesService } from './files.service';
import { UploadedFile } from './uploaded-file.entity';

describe('FilesService', () => {
  let service: FilesService;
  let mockRepository: Record<string, jest.Mock>;

  // Spy on fs methods instead of jest.mock('fs') to avoid breaking
  // path-scurry which depends on fs internals (fs.native).
  let existsSyncSpy: jest.SpyInstance;
  let mkdirSyncSpy: jest.SpyInstance;
  let writeFileSyncSpy: jest.SpyInstance;
  let createReadStreamSpy: jest.SpyInstance;

  const mockFile = {
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

  const mockFileRecord = {
    id: 1,
    fileName: 'test-document.pdf',
    storedFileName: '1700000000000-test-document.pdf',
    contentType: 'application/pdf',
    fileSize: 1024,
    filePath: './uploads/1700000000000-test-document.pdf',
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    mkdirSyncSpy = jest.spyOn(fs, 'mkdirSync').mockReturnValue(undefined);
    writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync').mockReturnValue(undefined);
    createReadStreamSpy = jest.spyOn(fs, 'createReadStream');

    mockRepository = {
      create: jest.fn().mockReturnValue(mockFileRecord),
      save: jest.fn().mockResolvedValue(mockFileRecord),
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: getRepositoryToken(UploadedFile),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveFile', () => {
    it('should create upload directory if it does not exist', async () => {
      existsSyncSpy.mockReturnValue(false);

      await service.saveFile(mockFile as any);

      expect(mkdirSyncSpy).toHaveBeenCalledWith('./uploads');
    });

    it('should not create upload directory if it already exists', async () => {
      existsSyncSpy.mockReturnValue(true);

      await service.saveFile(mockFile as any);

      expect(mkdirSyncSpy).not.toHaveBeenCalled();
    });

    it('should write file to disk and save record to database', async () => {
      existsSyncSpy.mockReturnValue(true);

      const result = await service.saveFile(mockFile as any);

      expect(writeFileSyncSpy).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: 'test-document.pdf',
          contentType: 'application/pdf',
          fileSize: 1024,
        }),
      );
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockFileRecord);
    });
  });

  describe('getFile', () => {
    it('should return a streamable file when file record and file exist', async () => {
      const mockStream = { pipe: jest.fn() };
      mockRepository.findOneBy.mockResolvedValue(mockFileRecord);
      existsSyncSpy.mockReturnValue(true);
      createReadStreamSpy.mockReturnValue(mockStream);

      const result = await service.getFile(1);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(createReadStreamSpy).toHaveBeenCalledWith(mockFileRecord.filePath);
      expect(result.contentType).toBe('application/pdf');
      expect(result.fileName).toBe('test-document.pdf');
      expect(result.file).toBeDefined();
    });

    it('should throw NotFoundException when file record is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getFile(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when file does not exist on disk', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockFileRecord);
      existsSyncSpy.mockReturnValue(false);

      await expect(service.getFile(1)).rejects.toThrow(NotFoundException);
    });
  });
});
