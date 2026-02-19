import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateDepartmentCommand } from './update-department.command';
import { DepartmentDto } from '../dto/department.dto';
import { IDepartmentRepository } from '../../domain/interfaces/department.repository.interface';
export declare class UpdateDepartmentHandler implements ICommandHandler<UpdateDepartmentCommand> {
    private readonly departmentRepository;
    constructor(departmentRepository: IDepartmentRepository);
    execute(command: UpdateDepartmentCommand): Promise<DepartmentDto>;
}
