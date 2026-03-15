import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetFilesQuery } from './get-files.query';
import { UploadedFileDto } from '../dto/uploaded-file.dto';
import { UploadedFileMapper } from '../mappers/uploaded-file.mapper';
import { IUploadedFileRepository } from '../../domain/interfaces/uploaded-file.repository.interface';
import { PagedResult, createPagedResult } from '@/common/types/paginated';

@QueryHandler(GetFilesQuery)
export class GetFilesHandler implements IQueryHandler<GetFilesQuery> {
  constructor(
    @Inject(IUploadedFileRepository)
    private readonly fileRepository: IUploadedFileRepository,
  ) {}

  async execute(query: GetFilesQuery): Promise<PagedResult<UploadedFileDto>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const result = await this.fileRepository.findByFilters({
      category: query.category,
      isPublic: query.isPublic,
      page,
      pageSize,
    });

    return createPagedResult(
      result.data.map(UploadedFileMapper.toDto),
      result.total,
      page,
      pageSize,
    );
  }
}
