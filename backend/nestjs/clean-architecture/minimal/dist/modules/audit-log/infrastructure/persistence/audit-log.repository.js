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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("../../domain/entities/audit-log.entity");
const audit_log_orm_entity_1 = require("./audit-log.orm-entity");
let AuditLogRepository = class AuditLogRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async findByFilters(filters) {
        const { entityName, entityId, userId, action, fromDate, toDate, page = 1, pageSize = 20 } = filters;
        const queryBuilder = this.repository.createQueryBuilder('audit');
        if (entityName) {
            queryBuilder.andWhere('audit.entityName = :entityName', { entityName });
        }
        if (entityId) {
            queryBuilder.andWhere('audit.entityId = :entityId', { entityId });
        }
        if (userId) {
            queryBuilder.andWhere('audit.userId = :userId', { userId });
        }
        if (action) {
            queryBuilder.andWhere('audit.action = :action', { action });
        }
        if (fromDate) {
            queryBuilder.andWhere('audit.timestamp >= :fromDate', { fromDate });
        }
        if (toDate) {
            queryBuilder.andWhere('audit.timestamp <= :toDate', { toDate });
        }
        queryBuilder
            .orderBy('audit.timestamp', 'DESC')
            .skip((page - 1) * pageSize)
            .take(pageSize);
        const entities = await queryBuilder.getMany();
        return entities.map((entity) => this.toDomain(entity));
    }
    async findByFiltersPaginated(filters) {
        const { entityName, entityId, userId, action, fromDate, toDate, page = 1, pageSize = 20, sortBy, sortDir = 'desc', search, } = filters;
        const queryBuilder = this.repository.createQueryBuilder('audit');
        if (entityName) {
            queryBuilder.andWhere('audit.entityName = :entityName', { entityName });
        }
        if (entityId) {
            queryBuilder.andWhere('audit.entityId = :entityId', { entityId });
        }
        if (userId) {
            queryBuilder.andWhere('audit.userId = :userId', { userId });
        }
        if (action) {
            queryBuilder.andWhere('audit.action = :action', { action });
        }
        if (fromDate) {
            queryBuilder.andWhere('audit.timestamp >= :fromDate', { fromDate });
        }
        if (toDate) {
            queryBuilder.andWhere('audit.timestamp <= :toDate', { toDate });
        }
        if (search) {
            queryBuilder.andWhere('(audit.entityName ILIKE :search OR audit.entityId ILIKE :search OR audit.action ILIKE :search)', { search: `%${search}%` });
        }
        const validSortFields = ['id', 'entityName', 'entityId', 'action', 'userId', 'timestamp'];
        const sortFieldMap = {
            id: 'audit.id',
            entityName: 'audit.entityName',
            entityId: 'audit.entityId',
            action: 'audit.action',
            userId: 'audit.userId',
            timestamp: 'audit.timestamp',
        };
        if (sortBy && validSortFields.includes(sortBy)) {
            queryBuilder.orderBy(sortFieldMap[sortBy], sortDir.toUpperCase());
        }
        else {
            queryBuilder.orderBy('audit.timestamp', 'DESC');
        }
        const totalItems = await queryBuilder.getCount();
        queryBuilder.skip((page - 1) * pageSize).take(pageSize);
        const entities = await queryBuilder.getMany();
        return {
            items: entities.map((entity) => this.toDomain(entity)),
            totalItems,
        };
    }
    async save(auditLog) {
        const entity = this.toEntity(auditLog);
        const saved = await this.repository.save(entity);
        return this.toDomain(saved);
    }
    toDomain(entity) {
        return new audit_log_entity_1.AuditLog({
            id: entity.id,
            entityName: entity.entityName,
            entityId: entity.entityId,
            action: entity.action,
            oldValues: entity.oldValues,
            newValues: entity.newValues,
            affectedColumns: entity.affectedColumns,
            userId: entity.userId,
            timestamp: entity.timestamp,
        });
    }
    toEntity(domain) {
        return {
            id: domain.id,
            entityName: domain.entityName,
            entityId: domain.entityId,
            action: domain.action,
            oldValues: domain.oldValues,
            newValues: domain.newValues,
            affectedColumns: domain.affectedColumns,
            userId: domain.userId,
            timestamp: domain.timestamp,
        };
    }
};
exports.AuditLogRepository = AuditLogRepository;
exports.AuditLogRepository = AuditLogRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_orm_entity_1.AuditLogOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditLogRepository);
//# sourceMappingURL=audit-log.repository.js.map