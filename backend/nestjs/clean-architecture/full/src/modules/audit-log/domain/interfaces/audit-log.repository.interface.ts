import { AuditLog } from '../entities/audit-log.entity';

export interface GetAuditLogsFilters {
  entityName?: string;
  entityId?: string;
  userId?: string;
  action?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface AuditLogPaginatedResult {
  items: AuditLog[];
  totalItems: number;
}

export abstract class IAuditLogRepository {
  abstract findById(id: number): Promise<AuditLog | null>;
  abstract findByFilters(filters: GetAuditLogsFilters): Promise<AuditLog[]>;
  abstract findByFiltersPaginated(filters: GetAuditLogsFilters): Promise<AuditLogPaginatedResult>;
  abstract save(auditLog: AuditLog): Promise<AuditLog>;
}
