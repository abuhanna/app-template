import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadedFileOrmEntity } from './uploaded-file.orm-entity';
import {
  IUploadedFileRepository,
  FindFilesOptions,
} from '../../domain/interfaces/uploaded-file.repository.interface';
import { UploadedFile } from '../../domain/entities/uploaded-file.entity';

@Injectable()
export class UploadedFileRepository implements IUploadedFileRepository {
  constructor(
    @InjectRepository(UploadedFileOrmEntity)
    private readonly repository: Repository<UploadedFileOrmEntity>,
  ) {}

  async findById(id: number): Promise<UploadedFile | null> {
    const entity = await this.repository.findOne({ where: { id: String(id) } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByFilters(options: FindFilesOptions): Promise<{ data: UploadedFile[]; total: number }> {
    const { category, isPublic, page = 1, pageSize = 20 } = options;

    const queryBuilder = this.repository.createQueryBuilder('file');

    if (category) {
      queryBuilder.andWhere('file.category = :category', { category });
    }

    if (isPublic !== undefined) {
      queryBuilder.andWhere('file.isPublic = :isPublic', { isPublic });
    }

    queryBuilder
      .orderBy('file.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [entities, total] = await queryBuilder.getManyAndCount();

    return {
      data: entities.map((e) => this.toDomain(e)),
      total,
    };
  }

  async save(file: UploadedFile): Promise<UploadedFile> {
    const entity = this.toEntity(file);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(String(id));
  }

  private toDomain(entity: UploadedFileOrmEntity): UploadedFile {
    return UploadedFile.reconstitute(
      Number(entity.id),
      entity.fileName,
      entity.originalFileName,
      entity.contentType,
      Number(entity.fileSize),
      entity.storagePath,
      entity.description,
      entity.category,
      entity.isPublic,
      entity.createdAt,
      entity.updatedAt,
      entity.createdBy ? Number(entity.createdBy) : null,
      entity.updatedBy ? Number(entity.updatedBy) : null,
    );
  }

  private toEntity(domain: UploadedFile): UploadedFileOrmEntity {
    const entity = new UploadedFileOrmEntity();
    if (domain.id > 0) {
      entity.id = String(domain.id);
    }
    entity.fileName = domain.fileName;
    entity.originalFileName = domain.originalFileName;
    entity.contentType = domain.contentType;
    entity.fileSize = String(domain.fileSize);
    entity.storagePath = domain.storagePath;
    entity.description = domain.description;
    entity.category = domain.category;
    entity.isPublic = domain.isPublic;
    entity.createdBy = domain.createdBy ? String(domain.createdBy) : null;
    entity.updatedBy = domain.updatedBy ? String(domain.updatedBy) : null;
    return entity;
  }
}
