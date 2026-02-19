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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogOrmEntity = void 0;
const typeorm_1 = require("typeorm");
let AuditLogOrmEntity = class AuditLogOrmEntity {
};
exports.AuditLogOrmEntity = AuditLogOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AuditLogOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_name', length: 100 }),
    __metadata("design:type", String)
], AuditLogOrmEntity.prototype, "entityName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_id', length: 50 }),
    __metadata("design:type", String)
], AuditLogOrmEntity.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], AuditLogOrmEntity.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'old_values', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], AuditLogOrmEntity.prototype, "oldValues", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'new_values', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], AuditLogOrmEntity.prototype, "newValues", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'affected_columns', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], AuditLogOrmEntity.prototype, "affectedColumns", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], AuditLogOrmEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'timestamp' }),
    __metadata("design:type", Date)
], AuditLogOrmEntity.prototype, "timestamp", void 0);
exports.AuditLogOrmEntity = AuditLogOrmEntity = __decorate([
    (0, typeorm_1.Entity)('audit_logs'),
    (0, typeorm_1.Index)(['entityName']),
    (0, typeorm_1.Index)(['entityId']),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['timestamp'])
], AuditLogOrmEntity);
//# sourceMappingURL=audit-log.orm-entity.js.map