export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

export class AuditLog {
  id: number;
  entityName: string;
  entityId: string | null;
  action: AuditAction;
  userId: string | null;
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
    entityName: string,
    entityId: string | null,
    action: AuditAction,
    oldValues: string | null,
    newValues: string | null,
    affectedColumns: string | null,
    userId: string | null,
    userName?: string | null,
    details?: string | null,
    ipAddress?: string | null,
  ): AuditLog {
    return new AuditLog({
      entityName,
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
