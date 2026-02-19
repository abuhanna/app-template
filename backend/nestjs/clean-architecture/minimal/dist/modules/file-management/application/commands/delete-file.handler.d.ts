import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteFileCommand } from './delete-file.command';
import { IUploadedFileRepository } from '../../domain/interfaces/uploaded-file.repository.interface';
import { IFileStorageService } from '../../domain/interfaces/file-storage.service.interface';
export declare class DeleteFileHandler implements ICommandHandler<DeleteFileCommand> {
    private readonly fileRepository;
    private readonly fileStorage;
    private readonly logger;
    constructor(fileRepository: IUploadedFileRepository, fileStorage: IFileStorageService);
    execute(command: DeleteFileCommand): Promise<void>;
}
