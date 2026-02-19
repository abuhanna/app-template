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
exports.ExportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const export_service_1 = require("./export.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_orm_entity_1 = require("../user-management/infrastructure/persistence/user.orm-entity");
const department_orm_entity_1 = require("../department-management/infrastructure/persistence/department.orm-entity");
const audit_log_orm_entity_1 = require("../audit-log/infrastructure/persistence/audit-log.orm-entity");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ExportController = class ExportController {
    constructor(exportService, userRepository, departmentRepository, auditLogRepository) {
        this.exportService = exportService;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.auditLogRepository = auditLogRepository;
    }
    async exportUsers(res, format = 'xlsx', search, departmentId, isActive, currentUser) {
        const query = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.department', 'department');
        if (search) {
            query.andWhere('(user.username ILIKE :search OR user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)', { search: `%${search}%` });
        }
        if (departmentId) {
            query.andWhere('user.departmentId = :departmentId', { departmentId });
        }
        if (isActive !== undefined) {
            query.andWhere('user.isActive = :isActive', { isActive: isActive === 'true' });
        }
        const users = await query.getMany();
        const exportData = users.map((user) => ({
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || '-',
            role: user.role,
            departmentName: user.department?.name || '-',
            isActive: user.isActive ? 'Yes' : 'No',
            createdAt: user.createdAt?.toISOString().replace('T', ' ').split('.')[0] || '-',
            lastLoginAt: user.lastLoginAt?.toISOString().replace('T', ' ').split('.')[0] || '-',
        }));
        const result = await this.getExportResult(format, exportData, 'users', 'Users Report', {
            subtitle: this.buildFilterDescription(search, departmentId, isActive),
            generatedBy: currentUser?.username || 'System',
        });
        this.sendResponse(res, result);
    }
    async exportDepartments(res, format = 'xlsx', search, isActive, currentUser) {
        const query = this.departmentRepository.createQueryBuilder('department');
        if (search) {
            query.andWhere('(department.name ILIKE :search OR department.code ILIKE :search)', { search: `%${search}%` });
        }
        if (isActive !== undefined) {
            query.andWhere('department.isActive = :isActive', { isActive: isActive === 'true' });
        }
        const departments = await query.getMany();
        const exportData = departments.map((dept) => ({
            id: dept.id,
            code: dept.code,
            name: dept.name,
            description: dept.description || '-',
            isActive: dept.isActive ? 'Yes' : 'No',
            createdAt: dept.createdAt?.toISOString().replace('T', ' ').split('.')[0] || '-',
        }));
        const result = await this.getExportResult(format, exportData, 'departments', 'Departments Report', {
            generatedBy: currentUser?.username || 'System',
        });
        this.sendResponse(res, result);
    }
    async exportAuditLogs(res, format = 'xlsx', entityName, action, fromDate, toDate, limit = 1000, currentUser) {
        const query = this.auditLogRepository
            .createQueryBuilder('auditLog')
            .orderBy('auditLog.timestamp', 'DESC')
            .take(limit);
        if (entityName) {
            query.andWhere('auditLog.entityName = :entityName', { entityName });
        }
        if (action) {
            query.andWhere('auditLog.action = :action', { action });
        }
        if (fromDate) {
            query.andWhere('auditLog.timestamp >= :fromDate', { fromDate: new Date(fromDate) });
        }
        if (toDate) {
            query.andWhere('auditLog.timestamp <= :toDate', { toDate: new Date(toDate) });
        }
        const auditLogs = await query.getMany();
        const exportData = auditLogs.map((log) => ({
            id: log.id,
            entityName: log.entityName,
            entityId: log.entityId,
            action: log.action,
            userId: log.userId || '-',
            timestamp: log.timestamp?.toISOString().replace('T', ' ').split('.')[0] || '-',
            affectedColumns: log.affectedColumns || '-',
        }));
        const result = await this.getExportResult(format, exportData, 'audit_logs', 'Audit Log Report', {
            subtitle: `Entity: ${entityName || 'All'}, Action: ${action || 'All'}`,
            fromDate: fromDate ? new Date(fromDate) : undefined,
            toDate: toDate ? new Date(toDate) : undefined,
            generatedBy: currentUser?.username || 'System',
        });
        this.sendResponse(res, result);
    }
    async getExportResult(format, data, fileName, reportTitle, options) {
        switch (format.toLowerCase()) {
            case 'csv':
                return this.exportService.exportToCsv(data, fileName);
            case 'pdf':
                return this.exportService.exportToPdf(data, fileName, reportTitle, options);
            default:
                return this.exportService.exportToExcel(data, fileName);
        }
    }
    sendResponse(res, result) {
        res.set({
            'Content-Type': result.contentType,
            'Content-Disposition': `attachment; filename="${result.fileName}"`,
        });
        res.send(result.buffer);
    }
    buildFilterDescription(search, departmentId, isActive) {
        const filters = [];
        if (isActive !== undefined) {
            filters.push(`Status: ${isActive === 'true' ? 'Active' : 'Inactive'}`);
        }
        if (departmentId) {
            filters.push(`Department ID: ${departmentId}`);
        }
        if (search) {
            filters.push(`Search: "${search}"`);
        }
        return filters.length > 0 ? filters.join(' | ') : 'All Users';
    }
};
exports.ExportController = ExportController;
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Export users to CSV, Excel, or PDF' }),
    (0, swagger_1.ApiQuery)({ name: 'format', required: false, enum: ['csv', 'xlsx', 'pdf'] }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'departmentId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('format')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('departmentId')),
    __param(4, (0, common_1.Query)('isActive')),
    __param(5, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Number, String, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "exportUsers", null);
__decorate([
    (0, common_1.Get)('departments'),
    (0, swagger_1.ApiOperation)({ summary: 'Export departments to CSV, Excel, or PDF' }),
    (0, swagger_1.ApiQuery)({ name: 'format', required: false, enum: ['csv', 'xlsx', 'pdf'] }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('format')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('isActive')),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "exportDepartments", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Export audit logs to CSV, Excel, or PDF' }),
    (0, swagger_1.ApiQuery)({ name: 'format', required: false, enum: ['csv', 'xlsx', 'pdf'] }),
    (0, swagger_1.ApiQuery)({ name: 'entityName', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'action', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'fromDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'toDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('format')),
    __param(2, (0, common_1.Query)('entityName')),
    __param(3, (0, common_1.Query)('action')),
    __param(4, (0, common_1.Query)('fromDate')),
    __param(5, (0, common_1.Query)('toDate')),
    __param(6, (0, common_1.Query)('limit')),
    __param(7, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, Number, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "exportAuditLogs", null);
exports.ExportController = ExportController = __decorate([
    (0, swagger_1.ApiTags)('Export'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('export'),
    __param(1, (0, typeorm_1.InjectRepository)(user_orm_entity_1.UserOrmEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(department_orm_entity_1.DepartmentOrmEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(audit_log_orm_entity_1.AuditLogOrmEntity)),
    __metadata("design:paramtypes", [export_service_1.ExportService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ExportController);
//# sourceMappingURL=export.controller.js.map