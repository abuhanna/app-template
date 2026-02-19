import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetFileByIdQuery } from './get-file-by-id.query';
import { UploadedFileDto } from '../dto/uploaded-file.dto';
import { UploadedFileMapper } from '../mappers/uploaded-file.mapper';
import { IUploadedFileRepository } from '../../domain/interfaces/uploaded-file.repository.interface';

@QueryHandler(GetFileByIdQuery)
export class GetFileByIdHandler implements IQueryHandler<GetFileByIdQuery> {
  constructor(
    @Inject(IUploadedFileRepository)
    private readonly fileRepository: IUploadedFileRepository,
  ) {}

  async execute(query: GetFileByIdQuery): Promise<UploadedFileDto> {
    const file = await this.fileRepository.findById(query.id);
    if (!file) {
      throw new NotFoundException(`File with ID ${query.id} not found`);
    }
    return UploadedFileMapper.toDto(file);
  }
}
