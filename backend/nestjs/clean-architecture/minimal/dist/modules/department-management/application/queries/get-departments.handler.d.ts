import { IQueryHandler } from '@nestjs/cqrs';
import { GetDepartmentsQuery } from './get-departments.query';
import { DepartmentDto } from '../dto/department.dto';
import { IDepartmentRepository } from '../../domain/interfaces/department.repository.interface';
import { PagedResult } from '@/common/types/paginated';
export declare class GetDepartmentsHandler implements IQueryHandler<GetDepartmentsQuery> {
    private readonly departmentRepository;
    constructor(departmentRepository: IDepartmentRepository);
    execute(query: GetDepartmentsQuery): Promise<PagedResult<DepartmentDto>>;
}
