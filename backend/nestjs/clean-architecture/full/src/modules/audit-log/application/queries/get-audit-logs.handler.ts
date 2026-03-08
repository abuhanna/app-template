import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAuditLogsQuery } from './get-audit-logs.query';
import { IAuditLogRepository } from '../../domain/interfaces/audit-log.repository.interface';
import { AuditLogDto } from '../dto/audit-log.dto';
import { PagedResult, createPagedResult } from '@/common/types/paginated';

@QueryHandler(GetAuditLogsQuery)
export class GetAuditLogsHandler implements IQueryHandler<GetAuditLogsQuery> {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(query: GetAuditLogsQuery): Promise<PagedResult<AuditLogDto>> {
    const result = await this.auditLogRepository.findByFiltersPaginated({
      entityType: query.entityType,
      entityId: query.entityId,
      userId: query.userId,
      action: query.action,
      fromDate: query.fromDate,
      toDate: query.toDate,
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      search: query.search,
    });

    const auditLogDtos: AuditLogDto[] = result.items.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      userId: log.userId !== null ? String(log.userId) : null,
      userName: log.userName,
      details: log.details,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt,
    }));

    return createPagedResult(auditLogDtos, result.totalItems, query.page, query.pageSize);
  }
}
