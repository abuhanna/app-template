import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../../domain/entities/audit-log.entity';
import {
  IAuditLogRepository,
  GetAuditLogsFilters,
  AuditLogPaginatedResult,
} from '../../domain/interfaces/audit-log.repository.interface';
import { AuditLogOrmEntity } from './audit-log.orm-entity';

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(
    @InjectRepository(AuditLogOrmEntity)
    private readonly repository: Repository<AuditLogOrmEntity>,
  ) {}

  async findById(id: number): Promise<AuditLog | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByFilters(filters: GetAuditLogsFilters): Promise<AuditLog[]> {
    const { entityType, entityId, userId, action, fromDate, toDate, page = 1, pageSize = 10 } = filters;

    const queryBuilder = this.repository.createQueryBuilder('audit');

    if (entityType) {
      queryBuilder.andWhere('audit.entityType = :entityType', { entityType });
    }

    if (entityId) {
      queryBuilder.andWhere('audit.entityId = :entityId', { entityId });
    }

    if (userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId });
    }

    if (action) {
      queryBuilder.andWhere('audit.action = :action', { action });
    }

    if (fromDate) {
      queryBuilder.andWhere('audit.createdAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('audit.createdAt <= :toDate', { toDate });
    }

    queryBuilder
      .orderBy('audit.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const entities = await queryBuilder.getMany();

    return entities.map((entity) => this.toDomain(entity));
  }

  async findByFiltersPaginated(filters: GetAuditLogsFilters): Promise<AuditLogPaginatedResult> {
    const {
      entityType,
      entityId,
      userId,
      action,
      fromDate,
      toDate,
      page = 1,
      pageSize = 10,
      sortBy,
      sortOrder = 'desc',
      search,
    } = filters;

    const queryBuilder = this.repository.createQueryBuilder('audit');

    if (entityType) {
      queryBuilder.andWhere('audit.entityType = :entityType', { entityType });
    }

    if (entityId) {
      queryBuilder.andWhere('audit.entityId = :entityId', { entityId });
    }

    if (userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId });
    }

    if (action) {
      queryBuilder.andWhere('audit.action = :action', { action });
    }

    if (fromDate) {
      queryBuilder.andWhere('audit.createdAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('audit.createdAt <= :toDate', { toDate });
    }

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(audit.entityType ILIKE :search OR audit.entityId ILIKE :search OR audit.action ILIKE :search OR audit.userName ILIKE :search OR audit.details ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    const validSortFields = ['id', 'entityType', 'entityId', 'action', 'userId', 'createdAt'];
    const sortFieldMap: Record<string, string> = {
      id: 'audit.id',
      entityType: 'audit.entityType',
      entityId: 'audit.entityId',
      action: 'audit.action',
      userId: 'audit.userId',
      createdAt: 'audit.createdAt',
    };

    if (sortBy && validSortFields.includes(sortBy)) {
      queryBuilder.orderBy(sortFieldMap[sortBy], sortOrder.toUpperCase() as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('audit.createdAt', 'DESC');
    }

    // Get total count
    const totalItems = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    const entities = await queryBuilder.getMany();

    return {
      items: entities.map((entity) => this.toDomain(entity)),
      totalItems,
    };
  }

  async save(auditLog: AuditLog): Promise<AuditLog> {
    const entity = this.toEntity(auditLog);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: AuditLogOrmEntity): AuditLog {
    return new AuditLog({
      id: entity.id,
      entityType: entity.entityType,
      entityId: entity.entityId,
      action: entity.action as AuditAction,
      userId: entity.userId,
      userName: entity.userName,
      details: entity.details,
      ipAddress: entity.ipAddress,
      oldValues: entity.oldValues,
      newValues: entity.newValues,
      affectedColumns: entity.affectedColumns,
      createdAt: entity.createdAt,
    });
  }

  private toEntity(domain: AuditLog): Partial<AuditLogOrmEntity> {
    return {
      id: domain.id,
      entityType: domain.entityType,
      entityId: domain.entityId,
      action: domain.action,
      userId: domain.userId,
      userName: domain.userName,
      details: domain.details,
      ipAddress: domain.ipAddress,
      oldValues: domain.oldValues,
      newValues: domain.newValues,
      affectedColumns: domain.affectedColumns,
      createdAt: domain.createdAt,
    };
  }
}
