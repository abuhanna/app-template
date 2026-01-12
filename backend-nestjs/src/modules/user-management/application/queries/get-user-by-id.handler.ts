import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetUserByIdQuery } from './get-user-by-id.query';
import { UserDto } from '../dto/user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IDepartmentRepository } from '@/modules/department-management/domain/interfaces/department.repository.interface';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IDepartmentRepository)
    private readonly departmentRepository: IDepartmentRepository,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<UserDto> {
    const user = await this.userRepository.findById(query.id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get department name if exists
    let departmentName: string | null = null;
    if (user.departmentId) {
      const department = await this.departmentRepository.findById(user.departmentId);
      departmentName = department?.name ?? null;
    }

    return UserMapper.toDto(user, departmentName);
  }
}
