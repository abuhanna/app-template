import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUsersQuery } from './get-users.query';
import { UserDto } from '../dto/user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IDepartmentRepository } from '@/modules/department-management/domain/interfaces/department.repository.interface';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IDepartmentRepository)
    private readonly departmentRepository: IDepartmentRepository,
  ) {}

  async execute(_query: GetUsersQuery): Promise<UserDto[]> {
    const users = await this.userRepository.findAll();
    const departments = await this.departmentRepository.findAll();

    // Create department map for quick lookup
    const departmentMap = new Map(departments.map((d) => [d.id, d.name]));

    return users.map((user) => UserMapper.toDto(user, departmentMap.get(user.departmentId ?? '')));
  }
}
