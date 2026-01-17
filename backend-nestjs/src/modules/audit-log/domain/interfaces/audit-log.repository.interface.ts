import { AuditLog } from '../entities/audit-log.entity';

export interface GetAuditLogsFilters {
  entityName?: string;
  entityId?: string;
  userId?: number;
  action?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  pageSize?: number;
}

export abstract class IAuditLogRepository {
  abstract findByFilters(filters: GetAuditLogsFilters): Promise<AuditLog[]>;
  abstract save(auditLog: AuditLog): Promise<AuditLog>;
}
