import { IQueryHandler } from '@nestjs/cqrs';
import { GetMyProfileQuery } from './get-my-profile.query';
import { UserInfoDto } from '../dto/user-info.dto';
import { IUserRepository } from '@/modules/user-management/domain/interfaces/user.repository.interface';
import { IDepartmentRepository } from '@/modules/department-management/domain/interfaces/department.repository.interface';
export declare class GetMyProfileHandler implements IQueryHandler<GetMyProfileQuery> {
    private readonly userRepository;
    private readonly departmentRepository;
    constructor(userRepository: IUserRepository, departmentRepository: IDepartmentRepository);
    execute(query: GetMyProfileQuery): Promise<UserInfoDto>;
}
