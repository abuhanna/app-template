import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../common/audit/audit-log.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async findAll(
    page: number,
    pageSize: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    search?: string,
    entityName?: string,
    entityId?: string,
    userId?: string,
    action?: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<PaginatedResult<any>> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    if (entityName) {
      queryBuilder.andWhere('audit.entityName = :entityName', { entityName });
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
      queryBuilder.andWhere('audit.createdAt >= :fromDate', { fromDate: new Date(fromDate) });
    }

    if (toDate) {
      queryBuilder.andWhere('audit.createdAt <= :toDate', { toDate: new Date(toDate) });
    }

    if (search) {
      queryBuilder.andWhere(
        '(audit.entityName ILIKE :search OR audit.action ILIKE :search OR audit.details ILIKE :search OR audit.userName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const validSortFields = ['id', 'action', 'entityName', 'createdAt'];
    const sortField = sortBy && validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const direction = sortOrder === 'asc' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(`audit.${sortField}`, direction);

    const totalItems = await queryBuilder.getCount();
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);
    const items = await queryBuilder.getMany();

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: items.map(item => this.mapToResponse(item)),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async findById(id: number): Promise<any> {
    const log = await this.auditLogRepository.findOneBy({ id });
    if (!log) {
      throw new NotFoundException('Audit log not found');
    }
    return this.mapToResponse(log);
  }

  private mapToResponse(log: AuditLog): any {
    return {
      id: log.id,
      entityType: log.entityName,
      entityId: log.entityId || null,
      action: log.action,
      oldValues: log.oldValues || null,
      newValues: log.newValues || null,
      affectedColumns: log.affectedColumns || null,
      userId: log.userId || null,
      userName: log.userName || null,
      details: log.details || null,
      ipAddress: log.ipAddress || null,
      createdAt: log.createdAt.toISOString(),
    };
  }
}
