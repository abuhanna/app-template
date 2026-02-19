"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuditSubscriber_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditSubscriber = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const audit_log_orm_entity_1 = require("../persistence/audit-log.orm-entity");
const audit_log_entity_1 = require("../../domain/entities/audit-log.entity");
const EXCLUDED_ENTITIES = [
    'AuditLogOrmEntity',
    'RefreshTokenOrmEntity',
    'NotificationOrmEntity',
];
let AuditSubscriber = AuditSubscriber_1 = class AuditSubscriber {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(AuditSubscriber_1.name);
        dataSource.subscribers.push(this);
    }
    afterInsert(event) {
        if (!this.shouldAudit(event.entity))
            return;
        this.logAudit(event, this.getEntityName(event.entity), this.getEntityId(event.entity), audit_log_entity_1.AuditAction.CREATED, null, event.entity);
    }
    afterUpdate(event) {
        if (!event.entity || !this.shouldAudit(event.entity))
            return;
        this.logAudit(event, this.getEntityName(event.entity), this.getEntityId(event.entity), audit_log_entity_1.AuditAction.UPDATED, event.databaseEntity, event.entity);
    }
    beforeRemove(event) {
        if (!event.entity || !this.shouldAudit(event.entity))
            return;
        this.logAudit(event, this.getEntityName(event.entity), this.getEntityId(event.entity), audit_log_entity_1.AuditAction.DELETED, event.entity, null);
    }
    shouldAudit(entity) {
        if (!entity)
            return false;
        const entityName = entity.constructor?.name;
        return !EXCLUDED_ENTITIES.includes(entityName);
    }
    getEntityName(entity) {
        return entity.constructor?.name?.replace('OrmEntity', '') || 'Unknown';
    }
    getEntityId(entity) {
        return entity?.id?.toString() || 'unknown';
    }
    async logAudit(event, entityName, entityId, action, oldValues, newValues) {
        try {
            const auditLog = new audit_log_orm_entity_1.AuditLogOrmEntity();
            auditLog.entityName = entityName;
            auditLog.entityId = entityId;
            auditLog.action = action;
            auditLog.oldValues = oldValues ? JSON.stringify(this.sanitizeForJson(oldValues)) : null;
            auditLog.newValues = newValues ? JSON.stringify(this.sanitizeForJson(newValues)) : null;
            auditLog.userId = null;
            auditLog.timestamp = new Date();
            await this.dataSource.getRepository(audit_log_orm_entity_1.AuditLogOrmEntity).save(auditLog);
        }
        catch (error) {
            this.logger.warn(`Failed to log ${action} audit for ${entityName} ${entityId}: ${error.message}`);
        }
    }
    sanitizeForJson(obj) {
        if (!obj)
            return null;
        const sanitized = {};
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (value === null || value === undefined) {
                sanitized[key] = value;
            }
            else if (typeof value === 'object' && !(value instanceof Date)) {
                continue;
            }
            else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
};
exports.AuditSubscriber = AuditSubscriber;
exports.AuditSubscriber = AuditSubscriber = AuditSubscriber_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, typeorm_1.EventSubscriber)(),
    __param(0, (0, typeorm_2.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], AuditSubscriber);
//# sourceMappingURL=audit.subscriber.js.map