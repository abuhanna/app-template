import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetDepartmentsQuery } from './get-departments.query';
import { DepartmentDto } from '../dto/department.dto';
import { DepartmentMapper } from '../mappers/department.mapper';
import { IDepartmentRepository } from '../../domain/interfaces/department.repository.interface';

@QueryHandler(GetDepartmentsQuery)
export class GetDepartmentsHandler implements IQueryHandler<GetDepartmentsQuery> {
  constructor(
    @Inject(IDepartmentRepository)
    private readonly departmentRepository: IDepartmentRepository,
  ) {}

  async execute(_query: GetDepartmentsQuery): Promise<DepartmentDto[]> {
    const departments = await this.departmentRepository.findAll();
    return DepartmentMapper.toDtoList(departments);
  }
}
