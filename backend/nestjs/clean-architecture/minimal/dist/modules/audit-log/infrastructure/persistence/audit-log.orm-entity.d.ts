export declare class AuditLogOrmEntity {
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
