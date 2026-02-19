import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { UploadFileCommand } from './upload-file.command';
import { UploadedFileDto } from '../dto/uploaded-file.dto';
import { UploadedFileMapper } from '../mappers/uploaded-file.mapper';
import { UploadedFile } from '../../domain/entities/uploaded-file.entity';
import { IUploadedFileRepository } from '../../domain/interfaces/uploaded-file.repository.interface';
import { IFileStorageService } from '../../domain/interfaces/file-storage.service.interface';

@CommandHandler(UploadFileCommand)
export class UploadFileHandler implements ICommandHandler<UploadFileCommand> {
  private readonly logger = new Logger(UploadFileHandler.name);

  constructor(
    @Inject(IUploadedFileRepository)
    private readonly fileRepository: IUploadedFileRepository,
    @Inject(IFileStorageService)
    private readonly fileStorage: IFileStorageService,
  ) {}

  async execute(command: UploadFileCommand): Promise<UploadedFileDto> {
    this.logger.log(`Uploading file: ${command.originalFileName}`);

    // Save file to storage
    const result = await this.fileStorage.saveFile(
      command.fileBuffer,
      command.originalFileName,
      command.contentType,
    );

    // Create database record
    const uploadedFile = UploadedFile.create({
      fileName: result.fileName,
      originalFileName: command.originalFileName,
      contentType: command.contentType,
      fileSize: command.fileSize,
      storagePath: result.storagePath,
      description: command.description,
      category: command.category,
      isPublic: command.isPublic,
    });

    const savedFile = await this.fileRepository.save(uploadedFile);

    this.logger.log(`File uploaded successfully: ${command.originalFileName} (ID: ${savedFile.id})`);

    return UploadedFileMapper.toDto(savedFile);
  }
}
