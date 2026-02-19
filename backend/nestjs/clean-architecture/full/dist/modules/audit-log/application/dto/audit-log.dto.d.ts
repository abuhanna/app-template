export declare class AuditLogDto {
    id: number;
    entityName: string;
    entityId: string;
    action: string;
    oldValues: string | null;
    newValues: string | null;
    affectedColumns: string | null;
    userId: number | null;
    timestamp: Date;
}
export declare class GetAuditLogsQueryDto {
    entityName?: string;
    entityId?: string;
    userId?: number;
    action?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    search?: string;
}
