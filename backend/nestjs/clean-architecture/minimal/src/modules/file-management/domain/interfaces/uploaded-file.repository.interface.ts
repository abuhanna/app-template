import { UploadedFile } from '../entities/uploaded-file.entity';

export interface FindFilesOptions {
  category?: string;
  isPublic?: boolean;
  page?: number;
  pageSize?: number;
}

export const IUploadedFileRepository = Symbol('IUploadedFileRepository');

export interface IUploadedFileRepository {
  findById(id: number): Promise<UploadedFile | null>;
  findByFilters(options: FindFilesOptions): Promise<{ data: UploadedFile[]; total: number }>;
  save(file: UploadedFile): Promise<UploadedFile>;
  delete(id: number): Promise<void>;
}
