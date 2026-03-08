export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

export class AuditLog {
  id: number;
  entityType: string;
  entityId: string | null;
  action: AuditAction;
  userId: number | null;
  userName: string | null;
  details: string | null;
  ipAddress: string | null;
  oldValues: string | null;
  newValues: string | null;
  affectedColumns: string | null;
  createdAt: Date;

  constructor(partial: Partial<AuditLog>) {
    Object.assign(this, partial);
  }

  static create(
    entityType: string,
    entityId: string | null,
    action: AuditAction,
    oldValues: string | null,
    newValues: string | null,
    affectedColumns: string | null,
    userId: number | null,
    userName?: string | null,
    details?: string | null,
    ipAddress?: string | null,
  ): AuditLog {
    return new AuditLog({
      entityType,
      entityId,
      action,
      oldValues,
      newValues,
      affectedColumns,
      userId,
      userName: userName ?? null,
      details: details ?? null,
      ipAddress: ipAddress ?? null,
      createdAt: new Date(),
    });
  }
}
