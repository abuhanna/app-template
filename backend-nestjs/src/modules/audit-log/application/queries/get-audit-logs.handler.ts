import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAuditLogsQuery } from './get-audit-logs.query';
import { IAuditLogRepository } from '../../domain/interfaces/audit-log.repository.interface';
import { AuditLogDto } from '../dto/audit-log.dto';

@QueryHandler(GetAuditLogsQuery)
export class GetAuditLogsHandler implements IQueryHandler<GetAuditLogsQuery> {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(query: GetAuditLogsQuery): Promise<AuditLogDto[]> {
    const auditLogs = await this.auditLogRepository.findByFilters({
      entityName: query.entityName,
      entityId: query.entityId,
      userId: query.userId,
      action: query.action,
      fromDate: query.fromDate,
      toDate: query.toDate,
      page: query.page,
      pageSize: query.pageSize,
    });

    return auditLogs.map((log) => ({
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
  }
}
