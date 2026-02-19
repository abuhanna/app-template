import { Repository } from 'typeorm';
import { UploadedFileOrmEntity } from './uploaded-file.orm-entity';
import { IUploadedFileRepository, FindFilesOptions } from '../../domain/interfaces/uploaded-file.repository.interface';
import { UploadedFile } from '../../domain/entities/uploaded-file.entity';
export declare class UploadedFileRepository implements IUploadedFileRepository {
    private readonly repository;
    constructor(repository: Repository<UploadedFileOrmEntity>);
    findById(id: number): Promise<UploadedFile | null>;
    findByFilters(options: FindFilesOptions): Promise<{
        data: UploadedFile[];
        total: number;
    }>;
    save(file: UploadedFile): Promise<UploadedFile>;
    delete(id: number): Promise<void>;
    private toDomain;
    private toEntity;
}
