import { Injectable, NotFoundException, ForbiddenException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadedFile } from './uploaded-file.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(UploadedFile)
    private readonly filesRepository: Repository<UploadedFile>,
  ) {}

  async findAll(
    query: PaginationQueryDto,
    category?: string,
    isPublic?: string,
  ): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const qb = this.filesRepository.createQueryBuilder('file');

    if (query.search) {
      qb.andWhere(
        '(file.originalFileName ILIKE :search OR file.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (category !== undefined && category !== '') {
      qb.andWhere('file.category = :category', { category });
    }

    if (isPublic !== undefined && isPublic !== '') {
      qb.andWhere('file.isPublic = :isPublic', { isPublic: isPublic === 'true' });
    }

    const validSortFields = ['id', 'originalFileName', 'fileSize', 'createdAt'];
    const sortField = query.sortBy && validSortFields.includes(query.sortBy) ? query.sortBy : 'createdAt';
    const direction = query.sortOrder === 'asc' ? 'ASC' : 'DESC';
    qb.orderBy(`file.${sortField}`, direction);

    const totalItems = await qb.getCount();
    qb.skip((page - 1) * pageSize).take(pageSize);
    const files = await qb.getMany();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: files.map(f => this.mapToResponse(f)),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async saveFile(
    file: Express.Multer.File,
    userId?: string,
    description?: string,
    category?: string,
    isPublic?: boolean,
  ): Promise<any> {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueName = `${crypto.randomUUID()}_${file.originalname}`;
    const storagePath = path.join(uploadDir, uniqueName);

    fs.writeFileSync(storagePath, file.buffer);

    const newFile = this.filesRepository.create({
      fileName: uniqueName,
      originalFileName: file.originalname,
      contentType: file.mimetype,
      fileSize: file.size,
      storagePath,
      description: description || null,
      category: category || null,
      isPublic: isPublic || false,
      createdBy: userId || null,
    });

    const saved = await this.filesRepository.save(newFile);
    return this.mapToResponse(saved);
  }

  async getFileMetadata(id: number): Promise<any> {
    const fileRecord = await this.filesRepository.findOneBy({ id });
    if (!fileRecord) {
      throw new NotFoundException('File not found');
    }
    return this.mapToResponse(fileRecord);
  }

  async getFileForDownload(id: number, isAuthenticated: boolean): Promise<{ file: StreamableFile; contentType: string; fileName: string }> {
    const fileRecord = await this.filesRepository.findOneBy({ id });
    if (!fileRecord) {
      throw new NotFoundException('File not found');
    }

    if (!fileRecord.isPublic && !isAuthenticated) {
      throw new ForbiddenException('Private file, not authorized');
    }

    if (!fs.existsSync(fileRecord.storagePath)) {
      throw new NotFoundException('File not found on disk');
    }

    const file = fs.createReadStream(fileRecord.storagePath);
    return {
      file: new StreamableFile(file),
      contentType: fileRecord.contentType,
      fileName: fileRecord.originalFileName,
    };
  }

  async deleteFile(id: number): Promise<void> {
    const fileRecord = await this.filesRepository.findOneBy({ id });
    if (!fileRecord) {
      throw new NotFoundException('File not found');
    }

    if (fs.existsSync(fileRecord.storagePath)) {
      fs.unlinkSync(fileRecord.storagePath);
    }

    await this.filesRepository.remove(fileRecord);
  }

  private mapToResponse(file: UploadedFile): any {
    return {
      id: file.id,
      fileName: file.fileName,
      originalFileName: file.originalFileName,
      contentType: file.contentType,
      fileSize: Number(file.fileSize),
      storagePath: file.storagePath,
      description: file.description || null,
      category: file.category || null,
      isPublic: file.isPublic,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt ? file.updatedAt.toISOString() : null,
      createdBy: file.createdBy || null,
      updatedBy: file.updatedBy || null,
      downloadUrl: file.downloadUrl,
    };
  }
}
