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
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const audit_log_repository_interface_1 = require("../../domain/interfaces/audit-log.repository.interface");
const audit_log_entity_1 = require("../../domain/entities/audit-log.entity");
let AuditService = AuditService_1 = class AuditService {
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
        this.logger = new common_1.Logger(AuditService_1.name);
    }
    async logCreate(entityName, entityId, newValues, userId) {
        try {
            const auditLog = audit_log_entity_1.AuditLog.create(entityName, entityId, audit_log_entity_1.AuditAction.CREATED, null, JSON.stringify(newValues), null, userId ?? null);
            await this.auditLogRepository.save(auditLog);
        }
        catch (error) {
            this.logger.warn(`Failed to log create audit for ${entityName} ${entityId}: ${error.message}`);
        }
    }
    async logUpdate(entityName, entityId, oldValues, newValues, affectedColumns, userId) {
        try {
            const auditLog = audit_log_entity_1.AuditLog.create(entityName, entityId, audit_log_entity_1.AuditAction.UPDATED, oldValues ? JSON.stringify(oldValues) : null, JSON.stringify(newValues), affectedColumns ? JSON.stringify(affectedColumns) : null, userId ?? null);
            await this.auditLogRepository.save(auditLog);
        }
        catch (error) {
            this.logger.warn(`Failed to log update audit for ${entityName} ${entityId}: ${error.message}`);
        }
    }
    async logDelete(entityName, entityId, oldValues, userId) {
        try {
            const auditLog = audit_log_entity_1.AuditLog.create(entityName, entityId, audit_log_entity_1.AuditAction.DELETED, JSON.stringify(oldValues), null, null, userId ?? null);
            await this.auditLogRepository.save(auditLog);
        }
        catch (error) {
            this.logger.warn(`Failed to log delete audit for ${entityName} ${entityId}: ${error.message}`);
        }
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_log_repository_interface_1.IAuditLogRepository])
], AuditService);
//# sourceMappingURL=audit.service.js.map