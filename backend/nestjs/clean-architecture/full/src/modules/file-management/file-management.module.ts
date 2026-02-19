import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

// Domain
import { IUploadedFileRepository } from './domain/interfaces/uploaded-file.repository.interface';
import { IFileStorageService } from './domain/interfaces/file-storage.service.interface';

// Application - Commands
import { UploadFileHandler, DeleteFileHandler } from './application/commands';

// Application - Queries
import { GetFilesHandler, GetFileByIdHandler, DownloadFileHandler } from './application/queries';

// Infrastructure
import { UploadedFileOrmEntity } from './infrastructure/persistence/uploaded-file.orm-entity';
import { UploadedFileRepository } from './infrastructure/persistence/uploaded-file.repository';
import { FileStorageService } from './infrastructure/services/file-storage.service';

// Presentation
import { FilesController } from './presentation/files.controller';

const CommandHandlers = [UploadFileHandler, DeleteFileHandler];
const QueryHandlers = [GetFilesHandler, GetFileByIdHandler, DownloadFileHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([UploadedFileOrmEntity]),
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
    }),
  ],
  controllers: [FilesController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: IUploadedFileRepository,
      useClass: UploadedFileRepository,
    },
    {
      provide: IFileStorageService,
      useClass: FileStorageService,
    },
  ],
  exports: [IUploadedFileRepository, IFileStorageService],
})
export class FileManagementModule {}
