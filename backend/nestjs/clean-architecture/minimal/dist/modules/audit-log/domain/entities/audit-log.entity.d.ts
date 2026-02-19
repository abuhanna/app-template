export declare enum AuditAction {
    CREATED = "CREATED",
    UPDATED = "UPDATED",
    DELETED = "DELETED"
}
export declare class AuditLog {
    id: number;
    entityName: string;
    entityId: string;
    action: AuditAction;
    oldValues: string | null;
    newValues: string | null;
    affectedColumns: string | null;
    userId: number | null;
    timestamp: Date;
    constructor(partial: Partial<AuditLog>);
    static create(entityName: string, entityId: string, action: AuditAction, oldValues: string | null, newValues: string | null, affectedColumns: string | null, userId: number | null): AuditLog;
}
