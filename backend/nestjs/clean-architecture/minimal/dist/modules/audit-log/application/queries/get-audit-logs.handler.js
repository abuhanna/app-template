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
exports.GetAuditLogsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const get_audit_logs_query_1 = require("./get-audit-logs.query");
const audit_log_repository_interface_1 = require("../../domain/interfaces/audit-log.repository.interface");
const paginated_1 = require("../../../../common/types/paginated");
let GetAuditLogsHandler = class GetAuditLogsHandler {
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    async execute(query) {
        const result = await this.auditLogRepository.findByFiltersPaginated({
            entityName: query.entityName,
            entityId: query.entityId,
            userId: query.userId,
            action: query.action,
            fromDate: query.fromDate,
            toDate: query.toDate,
            page: query.page,
            pageSize: query.pageSize,
            sortBy: query.sortBy,
            sortDir: query.sortDir,
            search: query.search,
        });
        const auditLogDtos = result.items.map((log) => ({
            id: log.id,
            entityName: log.entityName,
            entityId: log.entityId,
            action: log.action,
            oldValues: log.oldValues,
            newValues: log.newValues,
            affectedColumns: log.affectedColumns,
            userId: log.userId,
            timestamp: log.timestamp,
        }));
        return (0, paginated_1.createPagedResult)(auditLogDtos, result.totalItems, query.page, query.pageSize);
    }
};
exports.GetAuditLogsHandler = GetAuditLogsHandler;
exports.GetAuditLogsHandler = GetAuditLogsHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_audit_logs_query_1.GetAuditLogsQuery),
    __metadata("design:paramtypes", [audit_log_repository_interface_1.IAuditLogRepository])
], GetAuditLogsHandler);
//# sourceMappingURL=get-audit-logs.handler.js.map