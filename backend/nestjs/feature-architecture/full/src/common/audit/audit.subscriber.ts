import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<any> {
  constructor(
    @InjectDataSource() readonly dataSource: DataSource,
  ) {
    dataSource.subscribers.push(this);
  }

  async afterInsert(event: InsertEvent<any>) {
    if (event.metadata.tableName === 'audit_logs') return;
    await this.log(event.manager, 'INSERT', event.metadata.tableName, null, JSON.stringify(event.entity));
  }

  async afterUpdate(event: UpdateEvent<any>) {
    if (event.metadata.tableName === 'audit_logs') return;
    await this.log(event.manager, 'UPDATE', event.metadata.tableName, null, JSON.stringify(event.entity));
  }

  async afterRemove(event: RemoveEvent<any>) {
    if (event.metadata.tableName === 'audit_logs') return;
    await this.log(event.manager, 'DELETE', event.metadata.tableName, JSON.stringify(event.entityId), null);
  }

  private async log(manager: any, type: string, tableName: string, oldValues: string | null, newValues: string | null) {
    const audit = new AuditLog();
    audit.type = type;
    audit.tableName = tableName;
    audit.oldValues = oldValues ? oldValues : undefined;
    audit.newValues = newValues ? newValues : undefined;
    await manager.save(AuditLog, audit);
  }
}
