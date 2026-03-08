import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';

const TABLE_TO_ENTITY_TYPE: Record<string, string> = {
  users: 'User',
  uploaded_files: 'File',
  notifications: 'Notification',
};

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<any> {
  constructor(
    @InjectDataSource() readonly dataSource: DataSource,
  ) {
    dataSource.subscribers.push(this);
  }

  async afterInsert(event: InsertEvent<any>) {
    if (event.metadata.tableName === 'audit_logs' || event.metadata.tableName === 'refresh_tokens') return;
    await this.log(event.manager, 'create', event.metadata.tableName, event.entity);
  }

  async afterUpdate(event: UpdateEvent<any>) {
    if (event.metadata.tableName === 'audit_logs' || event.metadata.tableName === 'refresh_tokens') return;
    await this.log(event.manager, 'update', event.metadata.tableName, event.entity);
  }

  async afterRemove(event: RemoveEvent<any>) {
    if (event.metadata.tableName === 'audit_logs' || event.metadata.tableName === 'refresh_tokens') return;
    await this.log(event.manager, 'delete', event.metadata.tableName, event.entity, event.entityId?.toString());
  }

  private async log(manager: any, action: string, tableName: string, entity: any, entityId?: string) {
    const audit = new AuditLog();
    audit.action = action;
    audit.entityType = TABLE_TO_ENTITY_TYPE[tableName] || tableName;
    audit.entityId = entityId || entity?.id?.toString() || null;
    audit.details = entity ? JSON.stringify(entity) : null;
    await manager.save(AuditLog, audit);
  }
}
