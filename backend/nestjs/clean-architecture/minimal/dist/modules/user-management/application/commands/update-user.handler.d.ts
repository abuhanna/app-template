import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from './update-user.command';
import { UserDto } from '../dto/user.dto';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IDepartmentRepository } from '@/modules/department-management/domain/interfaces/department.repository.interface';
export declare class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
    private readonly userRepository;
    private readonly departmentRepository;
    constructor(userRepository: IUserRepository, departmentRepository: IDepartmentRepository);
    execute(command: UpdateUserCommand): Promise<UserDto>;
}
