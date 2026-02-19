import { IQueryHandler } from '@nestjs/cqrs';
import { GetFilesQuery } from './get-files.query';
import { UploadedFileDto } from '../dto/uploaded-file.dto';
import { IUploadedFileRepository } from '../../domain/interfaces/uploaded-file.repository.interface';
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export declare class GetFilesHandler implements IQueryHandler<GetFilesQuery> {
    private readonly fileRepository;
    constructor(fileRepository: IUploadedFileRepository);
    execute(query: GetFilesQuery): Promise<PaginatedResult<UploadedFileDto>>;
}
