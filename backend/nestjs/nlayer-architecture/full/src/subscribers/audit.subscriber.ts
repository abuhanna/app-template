import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';

const ENTITY_TYPE_MAP: Record<string, string> = {
  users: 'User',
  departments: 'Department',
  uploaded_files: 'File',
  notifications: 'Notification',
};

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<any> {
  constructor(@InjectDataSource() readonly dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  async afterInsert(event: InsertEvent<any>) {
    if (event.metadata.tableName === 'audit_logs' || event.metadata.tableName === 'refresh_tokens') return;
    const entityType = ENTITY_TYPE_MAP[event.metadata.tableName] || event.metadata.tableName;
    const entityId = event.entity?.id?.toString() || null;
    await this.log(event.manager, 'create', entityType, entityId, null);
  }

  async afterUpdate(event: UpdateEvent<any>) {
    if (event.metadata.tableName === 'audit_logs' || event.metadata.tableName === 'refresh_tokens') return;
    const entityType = ENTITY_TYPE_MAP[event.metadata.tableName] || event.metadata.tableName;
    const entityId = event.entity?.id?.toString() || (event.databaseEntity as any)?.id?.toString() || null;
    await this.log(event.manager, 'update', entityType, entityId, null);
  }

  async afterRemove(event: RemoveEvent<any>) {
    if (event.metadata.tableName === 'audit_logs' || event.metadata.tableName === 'refresh_tokens') return;
    const entityType = ENTITY_TYPE_MAP[event.metadata.tableName] || event.metadata.tableName;
    const entityId = event.entityId?.toString() || null;
    await this.log(event.manager, 'delete', entityType, entityId, null);
  }

  private async log(
    manager: any,
    action: string,
    entityType: string,
    entityId: string | null,
    details: string | null,
  ) {
    const audit = new AuditLog();
    audit.action = action;
    audit.entityType = entityType;
    audit.entityId = entityId as string;
    audit.details = details as string;
    // userId and userName require AsyncLocalStorage (CLS) to access from subscriber
    // They will be null for subscriber-based auditing; explicit audit logging should set them
    await manager.save(AuditLog, audit);
  }
}
