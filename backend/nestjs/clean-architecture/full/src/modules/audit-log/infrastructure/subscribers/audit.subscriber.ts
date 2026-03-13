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
import { ClsService } from 'nestjs-cls';
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

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly cls: ClsService,
  ) {
    dataSource.subscribers.push(this);
  }

  afterInsert(event: InsertEvent<any>): void | Promise<any> {
    if (!this.shouldAudit(event.entity)) return;

    this.logAudit(
      this.resolveEntityName(event.entity),
      this.getEntityId(event.entity),
      AuditAction.CREATE,
      null,
      event.entity,
    );
  }

  afterUpdate(event: UpdateEvent<any>): void | Promise<any> {
    if (!event.entity || !this.shouldAudit(event.entity)) return;

    // Calculate diff
    const { oldValues, newValues } = this.calculateDiff(event.databaseEntity, event.entity);

    // If no changes (and not empty), skip.
    // Note: Sometimes strict diff might return empty if objects are identical.
    if (!oldValues && !newValues) return;

    this.logAudit(
      this.resolveEntityName(event.entity),
      this.getEntityId(event.entity),
      AuditAction.UPDATE,
      oldValues,
      newValues,
    );
  }

  beforeRemove(event: RemoveEvent<any>): void | Promise<any> {
    if (!event.entity || !this.shouldAudit(event.entity)) return;

    this.logAudit(
      this.resolveEntityName(event.entity),
      this.getEntityId(event.entity),
      AuditAction.DELETE,
      event.entity, // Old values are the entity being deleted
      null,
    );
  }

  private shouldAudit(entity: any): boolean {
    if (!entity) return false;
    const entityName = entity.constructor?.name;
    return !EXCLUDED_ENTITIES.includes(entityName);
  }

  private resolveEntityName(entity: any): string {
    return entity.constructor?.name?.replace('OrmEntity', '') || 'Unknown';
  }

  private getEntityId(entity: any): string {
    return entity?.id?.toString() || 'unknown';
  }

  private calculateDiff(oldEntity: any, newEntity: any): { oldValues: any, newValues: any } {
    if (!oldEntity || !newEntity) {
      return { oldValues: oldEntity, newValues: newEntity };
    }

    // Correction: event.entity in afterUpdate typically contains ONLY the updated properties + id.
    // So we should only compare keys present in event.entity.
    const actualOldValues: any = {};
    const actualNewValues: any = {};

    for (const key of Object.keys(newEntity)) {
        if (key === 'updatedAt' || key === 'createdAt' || typeof newEntity[key] === 'function') continue;

        const oldValue = oldEntity[key];
        const newValue = newEntity[key];

        if (!this.areValuesEqual(oldValue, newValue)) {
            actualOldValues[key] = oldValue;
            actualNewValues[key] = newValue;
        }
    }

    // If actualNewValues is empty, maybe nothing changed meaningful
    if (Object.keys(actualNewValues).length === 0) return { oldValues: null, newValues: null };

    return { oldValues: actualOldValues, newValues: actualNewValues };
  }

  private areValuesEqual(v1: any, v2: any): boolean {
    if (v1 === v2) return true;
    if (v1 instanceof Date && v2 instanceof Date) return v1.getTime() === v2.getTime();
    if (v1 instanceof Date && typeof v2 === 'string') return v1.getTime() === new Date(v2).getTime();
    return false;
  }

  private async logAudit(
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

      // Get User ID from CLS
      const user = this.cls.get('user');
      auditLog.userId = user ? String(user.id) : null;
      auditLog.userName = user ? (user.username || user.email || null) : null;

      auditLog.createdAt = new Date();

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
         if (value.constructor && value.constructor.name !== 'Object') {
             sanitized[key] = value.id ? value.id : value.toString();
         } else {
             sanitized[key] = value;
         }
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}
