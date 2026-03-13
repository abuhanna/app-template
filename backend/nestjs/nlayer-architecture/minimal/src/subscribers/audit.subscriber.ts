import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';

const ENTITY_NAME_MAP: Record<string, string> = {
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
    if (event.metadata.tableName === 'audit_logs') return;
    const entityName = ENTITY_NAME_MAP[event.metadata.tableName] || event.metadata.tableName;
    const entityId = event.entity?.id?.toString() || '';
    await this.log(event.manager, 'create', entityName, entityId, null);
  }

  async afterUpdate(event: UpdateEvent<any>) {
    if (event.metadata.tableName === 'audit_logs') return;
    const entityName = ENTITY_NAME_MAP[event.metadata.tableName] || event.metadata.tableName;
    const entityId = event.entity?.id?.toString() || (event.databaseEntity as any)?.id?.toString() || '';
    await this.log(event.manager, 'update', entityName, entityId, null);
  }

  async afterRemove(event: RemoveEvent<any>) {
    if (event.metadata.tableName === 'audit_logs') return;
    const entityName = ENTITY_NAME_MAP[event.metadata.tableName] || event.metadata.tableName;
    const entityId = event.entityId?.toString() || '';
    await this.log(event.manager, 'delete', entityName, entityId, null);
  }

  private async log(
    manager: any,
    action: string,
    entityName: string,
    entityId: string,
    details: string | null,
  ) {
    const audit = new AuditLog();
    audit.action = action;
    audit.entityName = entityName;
    audit.entityId = entityId;
    audit.details = details as string;
    await manager.save(AuditLog, audit);
  }
}
