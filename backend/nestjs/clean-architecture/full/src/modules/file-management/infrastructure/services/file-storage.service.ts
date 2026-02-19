import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  IFileStorageService,
  FileStorageResult,
} from '../../domain/interfaces/file-storage.service.interface';

@Injectable()
export class FileStorageService implements IFileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly storagePath: string;

  constructor(private readonly configService: ConfigService) {
    this.storagePath = this.configService.get<string>('FILE_STORAGE_PATH') || './uploads';

    // Ensure the upload directory exists
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
      this.logger.log(`Created upload directory: ${this.storagePath}`);
    }
  }

  async saveFile(
    fileBuffer: Buffer,
    originalFileName: string,
    contentType: string,
  ): Promise<FileStorageResult> {
    // Generate unique filename
    const ext = path.extname(originalFileName);
    const uniqueFileName = `${uuidv4()}${ext}`;

    // Create year/month subfolder structure
    const now = new Date();
    const subFolder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const folderPath = path.join(this.storagePath, subFolder);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, uniqueFileName);
    const storagePath = `${subFolder}/${uniqueFileName}`;

    await fs.promises.writeFile(filePath, fileBuffer);

    this.logger.log(`File saved: ${originalFileName} -> ${storagePath}`);

    return { fileName: uniqueFileName, storagePath };
  }

  async getFile(storagePath: string): Promise<Readable | null> {
    const fullPath = path.join(this.storagePath, storagePath);

    if (!fs.existsSync(fullPath)) {
      this.logger.warn(`File not found: ${storagePath}`);
      return null;
    }

    return fs.createReadStream(fullPath);
  }

  async deleteFile(storagePath: string): Promise<void> {
    const fullPath = path.join(this.storagePath, storagePath);

    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      this.logger.log(`File deleted: ${storagePath}`);
    } else {
      this.logger.warn(`File not found for deletion: ${storagePath}`);
    }
  }

  fileExists(storagePath: string): boolean {
    const fullPath = path.join(this.storagePath, storagePath);
    return fs.existsSync(fullPath);
  }
}
