import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadedFile } from '../entities/uploaded-file.entity';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(UploadedFile)
    private filesRepository: Repository<UploadedFile>,
  ) {}

  async findAllPaginated(
    page: number,
    pageSize: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    search?: string,
    category?: string,
    isPublic?: boolean,
  ): Promise<PaginatedResult<any>> {
    const queryBuilder = this.filesRepository.createQueryBuilder('file');

    if (search) {
      queryBuilder.andWhere(
        '(file.original_file_name ILIKE :search OR file.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category) {
      queryBuilder.andWhere('file.category = :category', { category });
    }

    if (isPublic !== undefined) {
      queryBuilder.andWhere('file.is_public = :isPublic', { isPublic });
    }

    const validSortFields = ['id', 'originalFileName', 'fileSize', 'createdAt'];
    const sortField = sortBy && validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const direction = sortOrder === 'asc' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(`file.${sortField}`, direction);

    const totalItems = await queryBuilder.getCount();
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);
    const items = await queryBuilder.getMany();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map((f) => this.mapToResponse(f)),
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

    const storedFileName = `${Date.now()}-${file.originalname}`;
    const storagePath = path.join(uploadDir, storedFileName);

    fs.writeFileSync(storagePath, file.buffer);

    const newFile = this.filesRepository.create({
      fileName: storedFileName,
      originalFileName: file.originalname,
      contentType: file.mimetype,
      fileSize: file.size,
      storagePath: storagePath,
      description: description ?? undefined,
      category: category ?? undefined,
      isPublic: isPublic ?? false,
      createdBy: userId ?? undefined,
    });

    const saved = await this.filesRepository.save(newFile);
    return this.mapToResponse(saved);
  }

  async findOne(id: number): Promise<any> {
    const fileRecord = await this.filesRepository.findOneBy({ id });
    if (!fileRecord) {
      throw new NotFoundException('File not found');
    }
    return this.mapToResponse(fileRecord);
  }

  async getFile(id: number): Promise<{ file: StreamableFile; contentType: string; fileName: string }> {
    const fileRecord = await this.filesRepository.findOneBy({ id });
    if (!fileRecord || !fs.existsSync(fileRecord.storagePath)) {
      throw new NotFoundException('File not found');
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
      description: file.description || null,
      category: file.category || null,
      isPublic: file.isPublic,
      createdAt: file.createdAt?.toISOString(),
      updatedAt: file.updatedAt ? file.updatedAt.toISOString() : null,
      createdBy: file.createdBy || null,
      downloadUrl: `/api/files/${file.id}/download`,
    };
  }
}
