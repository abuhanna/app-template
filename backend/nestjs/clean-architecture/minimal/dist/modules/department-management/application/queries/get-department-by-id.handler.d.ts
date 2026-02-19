import { IQueryHandler } from '@nestjs/cqrs';
import { GetDepartmentByIdQuery } from './get-department-by-id.query';
import { DepartmentDto } from '../dto/department.dto';
import { IDepartmentRepository } from '../../domain/interfaces/department.repository.interface';
export declare class GetDepartmentByIdHandler implements IQueryHandler<GetDepartmentByIdQuery> {
    private readonly departmentRepository;
    constructor(departmentRepository: IDepartmentRepository);
    execute(query: GetDepartmentByIdQuery): Promise<DepartmentDto>;
}
