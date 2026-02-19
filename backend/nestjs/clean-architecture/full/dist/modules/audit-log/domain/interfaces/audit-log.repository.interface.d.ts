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
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    search?: string;
}
export interface AuditLogPaginatedResult {
    items: AuditLog[];
    totalItems: number;
}
export declare abstract class IAuditLogRepository {
    abstract findByFilters(filters: GetAuditLogsFilters): Promise<AuditLog[]>;
    abstract findByFiltersPaginated(filters: GetAuditLogsFilters): Promise<AuditLogPaginatedResult>;
    abstract save(auditLog: AuditLog): Promise<AuditLog>;
}
