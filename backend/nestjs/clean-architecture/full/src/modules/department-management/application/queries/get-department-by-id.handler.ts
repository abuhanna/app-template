import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetDepartmentByIdQuery } from './get-department-by-id.query';
import { DepartmentDto } from '../dto/department.dto';
import { DepartmentMapper } from '../mappers/department.mapper';
import { IDepartmentRepository } from '../../domain/interfaces/department.repository.interface';

@QueryHandler(GetDepartmentByIdQuery)
export class GetDepartmentByIdHandler implements IQueryHandler<GetDepartmentByIdQuery> {
  constructor(
    @Inject(IDepartmentRepository)
    private readonly departmentRepository: IDepartmentRepository,
  ) {}

  async execute(query: GetDepartmentByIdQuery): Promise<DepartmentDto> {
    const department = await this.departmentRepository.findById(query.id);

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return DepartmentMapper.toDto(department);
  }
}
