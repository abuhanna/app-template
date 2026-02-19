import { Readable } from 'stream';

export interface FileStorageResult {
  fileName: string;
  storagePath: string;
}

export const IFileStorageService = Symbol('IFileStorageService');

export interface IFileStorageService {
  saveFile(
    fileBuffer: Buffer,
    originalFileName: string,
    contentType: string,
  ): Promise<FileStorageResult>;

  getFile(storagePath: string): Promise<Readable | null>;

  deleteFile(storagePath: string): Promise<void>;

  fileExists(storagePath: string): boolean;
}
