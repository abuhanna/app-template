import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUsersQuery } from './get-users.query';
import { UserDto } from '../dto/user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IDepartmentRepository } from '@/modules/department-management/domain/interfaces/department.repository.interface';
import { PagedResult, createPagedResult } from '@/common/types/paginated';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IDepartmentRepository)
    private readonly departmentRepository: IDepartmentRepository,
  ) {}

  async execute(query: GetUsersQuery): Promise<PagedResult<UserDto>> {
    const { page, pageSize, sortBy, sortDir, search } = query;

    const result = await this.userRepository.findAllPaginated({
      page,
      pageSize,
      sortBy,
      sortDir,
      search,
    });

    const departments = await this.departmentRepository.findAll();

    // Create department map for quick lookup
    const departmentMap = new Map(departments.map((d) => [d.id, d.name]));

    const userDtos = result.items.map((user) =>
      UserMapper.toDto(
        user,
        user.departmentId ? (departmentMap.get(user.departmentId) ?? null) : null,
      ),
    );

    return createPagedResult(userDtos, result.totalItems, page, pageSize);
  }
}
