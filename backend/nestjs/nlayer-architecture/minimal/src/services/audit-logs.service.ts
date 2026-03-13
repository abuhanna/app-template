import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

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

    if (action) {
      queryBuilder.andWhere('audit.action = :action', { action });
    }

    if (entityName) {
      queryBuilder.andWhere('audit.entity_name = :entityName', { entityName });
    }

    if (entityId) {
      queryBuilder.andWhere('audit.entity_id = :entityId', { entityId });
    }

    if (userId) {
      queryBuilder.andWhere('audit.user_id = :userId', { userId });
    }

    if (fromDate) {
      queryBuilder.andWhere('audit.created_at >= :fromDate', { fromDate: new Date(fromDate) });
    }

    if (toDate) {
      queryBuilder.andWhere('audit.created_at <= :toDate', { toDate: new Date(toDate) });
    }

    if (search) {
      queryBuilder.andWhere(
        '(audit.entity_name ILIKE :search OR audit.action ILIKE :search OR audit.details ILIKE :search)',
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
      data: items.map((item) => this.mapToResponse(item)),
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

  async findOne(id: number): Promise<any> {
    const audit = await this.auditLogRepository.findOneBy({ id });
    if (!audit) {
      throw new NotFoundException('Audit log not found');
    }
    return this.mapToResponse(audit);
  }

  private mapToResponse(audit: AuditLog): any {
    return {
      id: audit.id,
      entityName: audit.entityName,
      entityId: audit.entityId || null,
      action: audit.action,
      oldValues: audit.oldValues || null,
      newValues: audit.newValues || null,
      affectedColumns: audit.affectedColumns || null,
      userId: audit.userId || null,
      userName: audit.userName || null,
      details: audit.details || null,
      ipAddress: audit.ipAddress || null,
      createdAt: audit.createdAt?.toISOString(),
    };
  }
}
