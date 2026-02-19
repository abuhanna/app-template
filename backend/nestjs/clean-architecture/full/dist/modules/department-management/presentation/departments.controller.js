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
exports.DepartmentsController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const roles_decorator_1 = require("../../../common/decorators/roles.decorator");
const dto_1 = require("../../../common/dto");
const user_role_1 = require("../../user-management/domain/value-objects/user-role");
const dto_2 = require("../application/dto");
const commands_1 = require("../application/commands");
const queries_1 = require("../application/queries");
let DepartmentsController = class DepartmentsController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async findAll(queryDto) {
        return this.queryBus.execute(new queries_1.GetDepartmentsQuery(queryDto.page, queryDto.pageSize, queryDto.sortBy, queryDto.sortDir, queryDto.search));
    }
    async findOne(id) {
        return this.queryBus.execute(new queries_1.GetDepartmentByIdQuery(id));
    }
    async create(dto) {
        return this.commandBus.execute(new commands_1.CreateDepartmentCommand(dto.name, dto.code, dto.description));
    }
    async update(id, dto) {
        return this.commandBus.execute(new commands_1.UpdateDepartmentCommand(id, dto.name, dto.code, dto.description, dto.isActive));
    }
    async delete(id) {
        await this.commandBus.execute(new commands_1.DeleteDepartmentCommand(id));
    }
};
exports.DepartmentsController = DepartmentsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all departments with pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of departments' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get department by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: dto_2.DepartmentDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Department not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_1.UserRole.Admin),
    (0, swagger_1.ApiOperation)({ summary: 'Create new department (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: dto_2.DepartmentDto }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Department code already in use' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.CreateDepartmentDto]),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_1.UserRole.Admin),
    (0, swagger_1.ApiOperation)({ summary: 'Update department (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: dto_2.DepartmentDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Department not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_2.UpdateDepartmentDto]),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_1.UserRole.Admin),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete department (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Department deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Department not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Department has assigned users' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DepartmentsController.prototype, "delete", null);
exports.DepartmentsController = DepartmentsController = __decorate([
    (0, swagger_1.ApiTags)('Departments'),
    (0, common_1.Controller)('departments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], DepartmentsController);
//# sourceMappingURL=departments.controller.js.map