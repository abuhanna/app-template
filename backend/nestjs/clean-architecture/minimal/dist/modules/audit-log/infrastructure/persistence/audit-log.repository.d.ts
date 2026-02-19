import { Repository } from 'typeorm';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { IAuditLogRepository, GetAuditLogsFilters, AuditLogPaginatedResult } from '../../domain/interfaces/audit-log.repository.interface';
import { AuditLogOrmEntity } from './audit-log.orm-entity';
export declare class AuditLogRepository implements IAuditLogRepository {
    private readonly repository;
    constructor(repository: Repository<AuditLogOrmEntity>);
    findByFilters(filters: GetAuditLogsFilters): Promise<AuditLog[]>;
    findByFiltersPaginated(filters: GetAuditLogsFilters): Promise<AuditLogPaginatedResult>;
    save(auditLog: AuditLog): Promise<AuditLog>;
    private toDomain;
    private toEntity;
}
