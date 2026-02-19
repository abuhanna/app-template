import { ICommandHandler } from '@nestjs/cqrs';
import { CreateDepartmentCommand } from './create-department.command';
import { DepartmentDto } from '../dto/department.dto';
import { IDepartmentRepository } from '../../domain/interfaces/department.repository.interface';
export declare class CreateDepartmentHandler implements ICommandHandler<CreateDepartmentCommand> {
    private readonly departmentRepository;
    constructor(departmentRepository: IDepartmentRepository);
    execute(command: CreateDepartmentCommand): Promise<DepartmentDto>;
}
