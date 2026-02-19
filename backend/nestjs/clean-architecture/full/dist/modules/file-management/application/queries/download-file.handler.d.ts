import { IQueryHandler } from '@nestjs/cqrs';
import { Readable } from 'stream';
import { DownloadFileQuery } from './download-file.query';
import { IUploadedFileRepository } from '../../domain/interfaces/uploaded-file.repository.interface';
import { IFileStorageService } from '../../domain/interfaces/file-storage.service.interface';
export interface FileDownloadResult {
    stream: Readable;
    contentType: string;
    fileName: string;
}
export declare class DownloadFileHandler implements IQueryHandler<DownloadFileQuery> {
    private readonly fileRepository;
    private readonly fileStorage;
    private readonly logger;
    constructor(fileRepository: IUploadedFileRepository, fileStorage: IFileStorageService);
    execute(query: DownloadFileQuery): Promise<FileDownloadResult>;
}
