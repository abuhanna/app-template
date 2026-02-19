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
exports.AuditLogsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const user_role_1 = require("../../user-management/domain/value-objects/user-role");
const get_audit_logs_query_1 = require("../application/queries/get-audit-logs.query");
const audit_log_dto_1 = require("../application/dto/audit-log.dto");
let AuditLogsController = class AuditLogsController {
    constructor(queryBus) {
        this.queryBus = queryBus;
    }
    async getAuditLogs(queryDto) {
        const query = new get_audit_logs_query_1.GetAuditLogsQuery(queryDto.entityName, queryDto.entityId, queryDto.userId, queryDto.action, queryDto.fromDate ? new Date(queryDto.fromDate) : undefined, queryDto.toDate ? new Date(queryDto.toDate) : undefined, queryDto.page, queryDto.pageSize, queryDto.sortBy, queryDto.sortDir, queryDto.search);
        return this.queryBus.execute(query);
    }
};
exports.AuditLogsController = AuditLogsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit logs with pagination (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Paginated audit logs retrieved successfully',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_log_dto_1.GetAuditLogsQueryDto]),
    __metadata("design:returntype", Promise)
], AuditLogsController.prototype, "getAuditLogs", null);
exports.AuditLogsController = AuditLogsController = __decorate([
    (0, swagger_1.ApiTags)('Audit Logs'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('audit-logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_1.UserRole.Admin),
    __metadata("design:paramtypes", [cqrs_1.QueryBus])
], AuditLogsController);
//# sourceMappingURL=audit-logs.controller.js.map