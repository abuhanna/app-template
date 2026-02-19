import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { DeleteFileCommand } from './delete-file.command';
import { IUploadedFileRepository } from '../../domain/interfaces/uploaded-file.repository.interface';
import { IFileStorageService } from '../../domain/interfaces/file-storage.service.interface';

@CommandHandler(DeleteFileCommand)
export class DeleteFileHandler implements ICommandHandler<DeleteFileCommand> {
  private readonly logger = new Logger(DeleteFileHandler.name);

  constructor(
    @Inject(IUploadedFileRepository)
    private readonly fileRepository: IUploadedFileRepository,
    @Inject(IFileStorageService)
    private readonly fileStorage: IFileStorageService,
  ) {}

  async execute(command: DeleteFileCommand): Promise<void> {
    this.logger.log(`Deleting file with ID: ${command.id}`);

    const file = await this.fileRepository.findById(command.id);
    if (!file) {
      throw new NotFoundException(`File with ID ${command.id} not found`);
    }

    // Delete from storage
    await this.fileStorage.deleteFile(file.storagePath);

    // Delete from database
    await this.fileRepository.delete(command.id);

    this.logger.log(`File deleted successfully: ${command.id}`);
  }
}
