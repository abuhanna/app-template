import { EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent, DataSource } from 'typeorm';
export declare class AuditSubscriber implements EntitySubscriberInterface {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    afterInsert(event: InsertEvent<any>): void | Promise<any>;
    afterUpdate(event: UpdateEvent<any>): void | Promise<any>;
    beforeRemove(event: RemoveEvent<any>): void | Promise<any>;
    private shouldAudit;
    private getEntityName;
    private getEntityId;
    private logAudit;
    private sanitizeForJson;
}
