import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteDepartmentCommand } from './delete-department.command';
import { IDepartmentRepository } from '../../domain/interfaces/department.repository.interface';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';
export declare class DeleteDepartmentHandler implements ICommandHandler<DeleteDepartmentCommand> {
    private readonly departmentRepository;
    private readonly userRepository;
    constructor(departmentRepository: IDepartmentRepository, userRepository: IUserRepository);
    execute(command: DeleteDepartmentCommand): Promise<void>;
}
