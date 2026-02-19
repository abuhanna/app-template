import { IQueryHandler } from '@nestjs/cqrs';
import { GetUserByIdQuery } from './get-user-by-id.query';
import { UserDto } from '../dto/user.dto';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IDepartmentRepository } from '@/modules/department-management/domain/interfaces/department.repository.interface';
export declare class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
    private readonly userRepository;
    private readonly departmentRepository;
    constructor(userRepository: IUserRepository, departmentRepository: IDepartmentRepository);
    execute(query: GetUserByIdQuery): Promise<UserDto>;
}
