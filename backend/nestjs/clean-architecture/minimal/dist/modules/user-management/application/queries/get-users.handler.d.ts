import { IQueryHandler } from '@nestjs/cqrs';
import { GetUsersQuery } from './get-users.query';
import { UserDto } from '../dto/user.dto';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IDepartmentRepository } from '@/modules/department-management/domain/interfaces/department.repository.interface';
import { PagedResult } from '@/common/types/paginated';
export declare class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
    private readonly userRepository;
    private readonly departmentRepository;
    constructor(userRepository: IUserRepository, departmentRepository: IDepartmentRepository);
    execute(query: GetUsersQuery): Promise<PagedResult<UserDto>>;
}
