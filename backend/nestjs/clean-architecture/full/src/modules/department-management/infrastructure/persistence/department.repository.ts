import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentOrmEntity } from './department.orm-entity';
import { Department } from '../../domain/entities/department.entity';
import {
  IDepartmentRepository,
  DepartmentPaginationOptions,
  DepartmentPaginatedResult,
} from '../../domain/interfaces/department.repository.interface';

@Injectable()
export class DepartmentRepository implements IDepartmentRepository {
  constructor(
    @InjectRepository(DepartmentOrmEntity)
    private readonly repository: Repository<DepartmentOrmEntity>,
  ) {}

  async findById(id: number): Promise<Department | null> {
    const entity = await this.repository
      .createQueryBuilder('department')
      .loadRelationCountAndMap('department.userCount', 'department.users')
      .where('department.id = :id', { id: id.toString() })
      .getOne();
    return entity ? this.toDomain(entity) : null;
  }

  async findByCode(code: string): Promise<Department | null> {
    const entity = await this.repository.findOne({ where: { code: code.toUpperCase() } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Department[]> {
    const entities = await this.repository
      .createQueryBuilder('department')
      .loadRelationCountAndMap('department.userCount', 'department.users')
      .orderBy('department.name', 'ASC')
      .getMany();
    return entities.map((entity) => this.toDomain(entity));
  }

  async findAllPaginated(options: DepartmentPaginationOptions): Promise<DepartmentPaginatedResult> {
    const { page, pageSize, sortBy, sortOrder = 'desc', search } = options;

    const queryBuilder = this.repository.createQueryBuilder('department');

    // Load user count
    queryBuilder.loadRelationCountAndMap('department.userCount', 'department.users');

    // Apply search filter
    if (search) {
      queryBuilder.where(
        '(department.name ILIKE :search OR department.code ILIKE :search OR department.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    const validSortFields = ['id', 'name', 'code', 'isActive', 'createdAt', 'updatedAt'];
    const sortFieldMap: Record<string, string> = {
      id: 'department.id',
      name: 'department.name',
      code: 'department.code',
      isActive: 'department.is_active',
      createdAt: 'department.created_at',
      updatedAt: 'department.updated_at',
    };

    if (sortBy && validSortFields.includes(sortBy)) {
      queryBuilder.orderBy(sortFieldMap[sortBy], sortOrder.toUpperCase() as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('department.name', 'ASC');
    }

    // Get total count
    const totalItems = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    const entities = await queryBuilder.getMany();

    return {
      data: entities.map((entity) => this.toDomain(entity)),
      totalItems,
    };
  }

  async save(department: Department): Promise<Department> {
    const entity = this.toEntity(department);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id.toString());
  }

  private toDomain(entity: DepartmentOrmEntity): Department {
    return Department.reconstitute(
      parseInt(entity.id, 10),
      entity.name,
      entity.code,
      entity.description,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt,
      entity.createdBy,
      entity.updatedBy,
      entity.userCount ?? 0,
    );
  }

  private toEntity(department: Department): DepartmentOrmEntity {
    const entity = new DepartmentOrmEntity();
    if (department.id !== 0) {
      entity.id = department.id.toString();
    }
    entity.name = department.name;
    entity.code = department.code;
    entity.description = department.description;
    entity.isActive = department.isActive;
    entity.createdAt = department.createdAt;
    entity.updatedAt = department.updatedAt;
    entity.createdBy = department.createdBy;
    entity.updatedBy = department.updatedBy;
    return entity;
  }
}
