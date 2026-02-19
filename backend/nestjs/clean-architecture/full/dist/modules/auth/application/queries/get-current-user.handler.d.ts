import { IQueryHandler } from '@nestjs/cqrs';
import { GetCurrentUserQuery } from './get-current-user.query';
import { UserInfoDto } from '../dto/user-info.dto';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';
import { IDepartmentRepository } from '@/modules/department-management/domain/interfaces/department.repository.interface';
export declare class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery> {
    private readonly userRepository;
    private readonly departmentRepository;
    constructor(userRepository: IUserRepository, departmentRepository: IDepartmentRepository);
    execute(query: GetCurrentUserQuery): Promise<UserInfoDto>;
}
