export enum AuditAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

export class AuditLog {
  id: number;
  entityName: string;
  entityId: string;
  action: AuditAction;
  oldValues: string | null;
  newValues: string | null;
  affectedColumns: string | null;
  userId: number | null;
  timestamp: Date;

  constructor(partial: Partial<AuditLog>) {
    Object.assign(this, partial);
  }

  static create(
    entityName: string,
    entityId: string,
    action: AuditAction,
    oldValues: string | null,
    newValues: string | null,
    affectedColumns: string | null,
    userId: number | null,
  ): AuditLog {
    return new AuditLog({
      entityName,
      entityId,
      action,
      oldValues,
      newValues,
      affectedColumns,
      userId,
      timestamp: new Date(),
    });
  }
}
