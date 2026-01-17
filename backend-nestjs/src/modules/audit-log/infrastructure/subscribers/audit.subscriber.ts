import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  DataSource,
} from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AuditLogOrmEntity } from '../persistence/audit-log.orm-entity';
import { AuditAction } from '../../domain/entities/audit-log.entity';

// Entity types to exclude from audit logging
const EXCLUDED_ENTITIES = [
  'AuditLogOrmEntity',
  'RefreshTokenOrmEntity',
  'NotificationOrmEntity',
];

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger(AuditSubscriber.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  afterInsert(event: InsertEvent<any>): void | Promise<any> {
    if (!this.shouldAudit(event.entity)) return;

    this.logAudit(
      event,
      this.getEntityName(event.entity),
      this.getEntityId(event.entity),
      AuditAction.CREATED,
      null,
      event.entity,
    );
  }

  afterUpdate(event: UpdateEvent<any>): void | Promise<any> {
    if (!event.entity || !this.shouldAudit(event.entity)) return;

    this.logAudit(
      event,
      this.getEntityName(event.entity),
      this.getEntityId(event.entity),
      AuditAction.UPDATED,
      event.databaseEntity,
      event.entity,
    );
  }

  beforeRemove(event: RemoveEvent<any>): void | Promise<any> {
    if (!event.entity || !this.shouldAudit(event.entity)) return;

    this.logAudit(
      event,
      this.getEntityName(event.entity),
      this.getEntityId(event.entity),
      AuditAction.DELETED,
      event.entity,
      null,
    );
  }

  private shouldAudit(entity: any): boolean {
    if (!entity) return false;
    const entityName = entity.constructor?.name;
    return !EXCLUDED_ENTITIES.includes(entityName);
  }

  private getEntityName(entity: any): string {
    return entity.constructor?.name?.replace('OrmEntity', '') || 'Unknown';
  }

  private getEntityId(entity: any): string {
    return entity?.id?.toString() || 'unknown';
  }

  private async logAudit(
    event: InsertEvent<any> | UpdateEvent<any> | RemoveEvent<any>,
    entityName: string,
    entityId: string,
    action: AuditAction,
    oldValues: any,
    newValues: any,
  ): Promise<void> {
    try {
      const auditLog = new AuditLogOrmEntity();
      auditLog.entityName = entityName;
      auditLog.entityId = entityId;
      auditLog.action = action;
      auditLog.oldValues = oldValues ? JSON.stringify(this.sanitizeForJson(oldValues)) : null;
      auditLog.newValues = newValues ? JSON.stringify(this.sanitizeForJson(newValues)) : null;
      auditLog.userId = null; // Would need request context for this
      auditLog.timestamp = new Date();

      // Use a separate connection to avoid transaction issues
      await this.dataSource.getRepository(AuditLogOrmEntity).save(auditLog);
    } catch (error) {
      this.logger.warn(
        `Failed to log ${action} audit for ${entityName} ${entityId}: ${error.message}`,
      );
    }
  }

  private sanitizeForJson(obj: any): any {
    if (!obj) return null;

    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      // Skip circular references and complex objects
      if (value === null || value === undefined) {
        sanitized[key] = value;
      } else if (typeof value === 'object' && !(value instanceof Date)) {
        // Skip nested objects to avoid circular references
        continue;
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}
