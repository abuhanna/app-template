import { IQuery } from '@nestjs/cqrs';
export declare class GetAuditLogsQuery implements IQuery {
    readonly entityName?: string | undefined;
    readonly entityId?: string | undefined;
    readonly userId?: number | undefined;
    readonly action?: string | undefined;
    readonly fromDate?: Date | undefined;
    readonly toDate?: Date | undefined;
    readonly page: number;
    readonly pageSize: number;
    readonly sortBy?: string | undefined;
    readonly sortDir?: "asc" | "desc" | undefined;
    readonly search?: string | undefined;
    constructor(entityName?: string | undefined, entityId?: string | undefined, userId?: number | undefined, action?: string | undefined, fromDate?: Date | undefined, toDate?: Date | undefined, page?: number, pageSize?: number, sortBy?: string | undefined, sortDir?: "asc" | "desc" | undefined, search?: string | undefined);
}
