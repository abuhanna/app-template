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
      entityName: query.entityName,
      entityId: query.entityId,
      userId: query.userId,
      action: query.action,
      fromDate: query.fromDate,
      toDate: query.toDate,
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      search: query.search,
    });

    const auditLogDtos = result.items.map((log) => ({
      id: log.id,
      entityName: log.entityName,
      entityId: log.entityId,
      action: log.action,
      oldValues: log.oldValues,
      newValues: log.newValues,
      affectedColumns: log.affectedColumns,
      userId: log.userId,
      timestamp: log.timestamp,
    }));

    return createPagedResult(auditLogDtos, result.totalItems, query.page, query.pageSize);
  }
}
