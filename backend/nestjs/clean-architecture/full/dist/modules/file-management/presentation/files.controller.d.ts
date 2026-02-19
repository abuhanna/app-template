import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { UploadedFileDto } from '../application/dto';
import { PaginatedResult } from '../application/queries/get-files.handler';
export declare class FilesController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly logger;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    findAll(category?: string, isPublic?: string, page?: string, pageSize?: string): Promise<PaginatedResult<UploadedFileDto>>;
    findOne(id: number): Promise<UploadedFileDto>;
    upload(file: Express.Multer.File, description?: string, category?: string, isPublic?: string): Promise<UploadedFileDto>;
    download(id: number, res: Response): Promise<void>;
    delete(id: number): Promise<void>;
}
