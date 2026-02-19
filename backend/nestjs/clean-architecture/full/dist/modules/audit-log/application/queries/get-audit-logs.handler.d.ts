import { IQueryHandler } from '@nestjs/cqrs';
import { GetAuditLogsQuery } from './get-audit-logs.query';
import { IAuditLogRepository } from '../../domain/interfaces/audit-log.repository.interface';
import { AuditLogDto } from '../dto/audit-log.dto';
import { PagedResult } from '@/common/types/paginated';
export declare class GetAuditLogsHandler implements IQueryHandler<GetAuditLogsQuery> {
    private readonly auditLogRepository;
    constructor(auditLogRepository: IAuditLogRepository);
    execute(query: GetAuditLogsQuery): Promise<PagedResult<AuditLogDto>>;
}
