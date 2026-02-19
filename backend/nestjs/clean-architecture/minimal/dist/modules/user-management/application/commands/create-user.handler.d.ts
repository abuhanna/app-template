import { ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { UserDto } from '../dto/user.dto';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IDepartmentRepository } from '@/modules/department-management/domain/interfaces/department.repository.interface';
import { IPasswordService } from '@/modules/auth/domain/interfaces/password.service.interface';
export declare class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
    private readonly userRepository;
    private readonly departmentRepository;
    private readonly passwordService;
    constructor(userRepository: IUserRepository, departmentRepository: IDepartmentRepository, passwordService: IPasswordService);
    execute(command: CreateUserCommand): Promise<UserDto>;
}
