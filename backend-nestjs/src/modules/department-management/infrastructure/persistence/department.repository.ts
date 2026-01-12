import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentOrmEntity } from './department.orm-entity';
import { Department } from '../../domain/entities/department.entity';
import { IDepartmentRepository } from '../../domain/interfaces/department.repository.interface';

@Injectable()
export class DepartmentRepository implements IDepartmentRepository {
  constructor(
    @InjectRepository(DepartmentOrmEntity)
    private readonly repository: Repository<DepartmentOrmEntity>,
  ) {}

  async findById(id: string): Promise<Department | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCode(code: string): Promise<Department | null> {
    const entity = await this.repository.findOne({ where: { code: code.toUpperCase() } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Department[]> {
    const entities = await this.repository.find({ order: { name: 'ASC' } });
    return entities.map((entity) => this.toDomain(entity));
  }

  async save(department: Department): Promise<Department> {
    const entity = this.toEntity(department);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(entity: DepartmentOrmEntity): Department {
    return Department.reconstitute(
      entity.id,
      entity.name,
      entity.code,
      entity.description,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt,
      entity.createdBy,
      entity.updatedBy,
    );
  }

  private toEntity(department: Department): DepartmentOrmEntity {
    const entity = new DepartmentOrmEntity();
    entity.id = department.id;
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
