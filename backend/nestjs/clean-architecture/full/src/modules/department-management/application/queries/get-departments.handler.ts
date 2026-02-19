import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetDepartmentsQuery } from './get-departments.query';
import { DepartmentDto } from '../dto/department.dto';
import { DepartmentMapper } from '../mappers/department.mapper';
import { IDepartmentRepository } from '../../domain/interfaces/department.repository.interface';
import { PagedResult, createPagedResult } from '@/common/types/paginated';

@QueryHandler(GetDepartmentsQuery)
export class GetDepartmentsHandler implements IQueryHandler<GetDepartmentsQuery> {
  constructor(
    @Inject(IDepartmentRepository)
    private readonly departmentRepository: IDepartmentRepository,
  ) {}

  async execute(query: GetDepartmentsQuery): Promise<PagedResult<DepartmentDto>> {
    const { page, pageSize, sortBy, sortDir, search } = query;

    const result = await this.departmentRepository.findAllPaginated({
      page,
      pageSize,
      sortBy,
      sortDir,
      search,
    });

    const departmentDtos = DepartmentMapper.toDtoList(result.items);

    return createPagedResult(departmentDtos, result.totalItems, page, pageSize);
  }
}
