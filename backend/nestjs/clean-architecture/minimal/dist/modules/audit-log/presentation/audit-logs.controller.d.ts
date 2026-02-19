import { QueryBus } from '@nestjs/cqrs';
import { PagedResult } from '@/common/types/paginated';
import { AuditLogDto, GetAuditLogsQueryDto } from '../application/dto/audit-log.dto';
export declare class AuditLogsController {
    private readonly queryBus;
    constructor(queryBus: QueryBus);
    getAuditLogs(queryDto: GetAuditLogsQueryDto): Promise<PagedResult<AuditLogDto>>;
}
