import { IAuditLogRepository } from '../../domain/interfaces/audit-log.repository.interface';
export declare class AuditService {
    private readonly auditLogRepository;
    private readonly logger;
    constructor(auditLogRepository: IAuditLogRepository);
    logCreate(entityName: string, entityId: string, newValues: object, userId?: number): Promise<void>;
    logUpdate(entityName: string, entityId: string, oldValues: object | null, newValues: object, affectedColumns?: string[], userId?: number): Promise<void>;
    logDelete(entityName: string, entityId: string, oldValues: object, userId?: number): Promise<void>;
}
