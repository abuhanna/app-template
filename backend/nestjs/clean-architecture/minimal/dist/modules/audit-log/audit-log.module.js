"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const typeorm_1 = require("@nestjs/typeorm");
const audit_log_repository_interface_1 = require("./domain/interfaces/audit-log.repository.interface");
const get_audit_logs_handler_1 = require("./application/queries/get-audit-logs.handler");
const audit_log_orm_entity_1 = require("./infrastructure/persistence/audit-log.orm-entity");
const audit_log_repository_1 = require("./infrastructure/persistence/audit-log.repository");
const audit_service_1 = require("./infrastructure/services/audit.service");
const audit_subscriber_1 = require("./infrastructure/subscribers/audit.subscriber");
const audit_logs_controller_1 = require("./presentation/audit-logs.controller");
const QueryHandlers = [get_audit_logs_handler_1.GetAuditLogsHandler];
let AuditLogModule = class AuditLogModule {
};
exports.AuditLogModule = AuditLogModule;
exports.AuditLogModule = AuditLogModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule, typeorm_1.TypeOrmModule.forFeature([audit_log_orm_entity_1.AuditLogOrmEntity])],
        controllers: [audit_logs_controller_1.AuditLogsController],
        providers: [
            ...QueryHandlers,
            audit_service_1.AuditService,
            audit_subscriber_1.AuditSubscriber,
            {
                provide: audit_log_repository_interface_1.IAuditLogRepository,
                useClass: audit_log_repository_1.AuditLogRepository,
            },
        ],
        exports: [audit_service_1.AuditService, audit_log_repository_interface_1.IAuditLogRepository],
    })
], AuditLogModule);
//# sourceMappingURL=audit-log.module.js.map