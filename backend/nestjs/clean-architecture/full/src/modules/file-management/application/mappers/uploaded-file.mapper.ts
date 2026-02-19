import { UploadedFile } from '../../domain/entities/uploaded-file.entity';
import { UploadedFileDto } from '../dto/uploaded-file.dto';

export class UploadedFileMapper {
  static toDto(file: UploadedFile): UploadedFileDto {
    return {
      id: file.id,
      fileName: file.fileName,
      originalFileName: file.originalFileName,
      contentType: file.contentType,
      fileSize: file.fileSize,
      description: file.description,
      category: file.category,
      isPublic: file.isPublic,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      createdBy: file.createdBy,
      downloadUrl: `/api/files/${file.id}/download`,
    };
  }
}
