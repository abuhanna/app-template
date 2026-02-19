import { OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '../../modules/user-management/infrastructure/persistence/user.orm-entity';
import { DepartmentOrmEntity } from '../../modules/department-management/infrastructure/persistence/department.orm-entity';
export declare class SeedService implements OnApplicationBootstrap {
    private readonly userRepository;
    private readonly departmentRepository;
    private readonly logger;
    constructor(userRepository: Repository<UserOrmEntity>, departmentRepository: Repository<DepartmentOrmEntity>);
    onApplicationBootstrap(): Promise<void>;
    private seedDepartments;
    private seedUsers;
}
