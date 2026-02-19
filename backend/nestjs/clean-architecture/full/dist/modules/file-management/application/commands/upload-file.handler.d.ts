import { ICommandHandler } from '@nestjs/cqrs';
import { UploadFileCommand } from './upload-file.command';
import { UploadedFileDto } from '../dto/uploaded-file.dto';
import { IUploadedFileRepository } from '../../domain/interfaces/uploaded-file.repository.interface';
import { IFileStorageService } from '../../domain/interfaces/file-storage.service.interface';
export declare class UploadFileHandler implements ICommandHandler<UploadFileCommand> {
    private readonly fileRepository;
    private readonly fileStorage;
    private readonly logger;
    constructor(fileRepository: IUploadedFileRepository, fileStorage: IFileStorageService);
    execute(command: UploadFileCommand): Promise<UploadedFileDto>;
}
