import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { Readable } from 'stream';
import { DownloadFileQuery } from './download-file.query';
import { IUploadedFileRepository } from '../../domain/interfaces/uploaded-file.repository.interface';
import { IFileStorageService } from '../../domain/interfaces/file-storage.service.interface';

export interface FileDownloadResult {
  stream: Readable;
  contentType: string;
  fileName: string;
}

@QueryHandler(DownloadFileQuery)
export class DownloadFileHandler implements IQueryHandler<DownloadFileQuery> {
  private readonly logger = new Logger(DownloadFileHandler.name);

  constructor(
    @Inject(IUploadedFileRepository)
    private readonly fileRepository: IUploadedFileRepository,
    @Inject(IFileStorageService)
    private readonly fileStorage: IFileStorageService,
  ) {}

  async execute(query: DownloadFileQuery): Promise<FileDownloadResult> {
    const file = await this.fileRepository.findById(query.id);
    if (!file) {
      throw new NotFoundException(`File with ID ${query.id} not found`);
    }

    const stream = await this.fileStorage.getFile(file.storagePath);
    if (!stream) {
      this.logger.warn(`File storage not found: ${file.storagePath}`);
      throw new NotFoundException('File not found in storage');
    }

    return {
      stream,
      contentType: file.contentType,
      fileName: file.originalFileName,
    };
  }
}
