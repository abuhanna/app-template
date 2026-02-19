import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadedFile } from '../entities/uploaded-file.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(UploadedFile)
    private filesRepository: Repository<UploadedFile>,
  ) {}

  async saveFile(file: Express.Multer.File): Promise<UploadedFile> {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const storedFileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, storedFileName);

    fs.writeFileSync(filePath, file.buffer);

    const newFile = this.filesRepository.create({
      fileName: file.originalname,
      storedFileName: storedFileName,
      contentType: file.mimetype,
      fileSize: file.size,
      filePath: filePath,
    });

    return this.filesRepository.save(newFile);
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
}
