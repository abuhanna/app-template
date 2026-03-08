import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadedFile } from './uploaded-file.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(UploadedFile)
    private readonly filesRepository: Repository<UploadedFile>,
  ) {}

  async saveFile(file: Express.Multer.File): Promise<UploadedFile> {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storedFileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, storedFileName);

    fs.writeFileSync(filePath, file.buffer);

    const newFile = this.filesRepository.create({
      fileName: file.originalname,
      storedFileName,
      contentType: file.mimetype,
      fileSize: file.size,
      filePath,
    });

    return this.filesRepository.save(newFile);
  }

  async listFiles(): Promise<UploadedFile[]> {
    return this.filesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async getFile(id: number): Promise<{ file: StreamableFile; contentType: string; fileName: string }> {
    const fileRecord = await this.filesRepository.findOneBy({ id });
    if (!fileRecord || !fs.existsSync(fileRecord.filePath)) {
      throw new NotFoundException('File not found');
    }

    const file = fs.createReadStream(fileRecord.filePath);
    return {
      file: new StreamableFile(file),
      contentType: fileRecord.contentType,
      fileName: fileRecord.fileName,
    };
  }

  async deleteFile(id: number): Promise<void> {
    const fileRecord = await this.filesRepository.findOneBy({ id });
    if (!fileRecord) {
      throw new NotFoundException('File not found');
    }

    // Delete physical file if it exists
    if (fs.existsSync(fileRecord.filePath)) {
      fs.unlinkSync(fileRecord.filePath);
    }

    await this.filesRepository.remove(fileRecord);
  }
}
