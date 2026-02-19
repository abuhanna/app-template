import { IQueryHandler } from '@nestjs/cqrs';
import { GetFileByIdQuery } from './get-file-by-id.query';
import { UploadedFileDto } from '../dto/uploaded-file.dto';
import { IUploadedFileRepository } from '../../domain/interfaces/uploaded-file.repository.interface';
export declare class GetFileByIdHandler implements IQueryHandler<GetFileByIdQuery> {
    private readonly fileRepository;
    constructor(fileRepository: IUploadedFileRepository);
    execute(query: GetFileByIdQuery): Promise<UploadedFileDto>;
}
