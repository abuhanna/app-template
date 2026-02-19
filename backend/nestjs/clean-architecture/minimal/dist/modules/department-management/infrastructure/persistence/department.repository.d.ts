import { Repository } from 'typeorm';
import { DepartmentOrmEntity } from './department.orm-entity';
import { Department } from '../../domain/entities/department.entity';
import { IDepartmentRepository, DepartmentPaginationOptions, DepartmentPaginatedResult } from '../../domain/interfaces/department.repository.interface';
export declare class DepartmentRepository implements IDepartmentRepository {
    private readonly repository;
    constructor(repository: Repository<DepartmentOrmEntity>);
    findById(id: number): Promise<Department | null>;
    findByCode(code: string): Promise<Department | null>;
    findAll(): Promise<Department[]>;
    findAllPaginated(options: DepartmentPaginationOptions): Promise<DepartmentPaginatedResult>;
    save(department: Department): Promise<Department>;
    delete(id: number): Promise<void>;
    private toDomain;
    private toEntity;
}
