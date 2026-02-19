import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { IFileStorageService, FileStorageResult } from '../../domain/interfaces/file-storage.service.interface';
export declare class FileStorageService implements IFileStorageService {
    private readonly configService;
    private readonly logger;
    private readonly storagePath;
    constructor(configService: ConfigService);
    saveFile(fileBuffer: Buffer, originalFileName: string, contentType: string): Promise<FileStorageResult>;
    getFile(storagePath: string): Promise<Readable | null>;
    deleteFile(storagePath: string): Promise<void>;
    fileExists(storagePath: string): boolean;
}
