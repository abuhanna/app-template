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
exports.GetDepartmentsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_departments_query_1 = require("./get-departments.query");
const department_mapper_1 = require("../mappers/department.mapper");
const department_repository_interface_1 = require("../../domain/interfaces/department.repository.interface");
const paginated_1 = require("../../../../common/types/paginated");
let GetDepartmentsHandler = class GetDepartmentsHandler {
    constructor(departmentRepository) {
        this.departmentRepository = departmentRepository;
    }
    async execute(query) {
        const { page, pageSize, sortBy, sortDir, search } = query;
        const result = await this.departmentRepository.findAllPaginated({
            page,
            pageSize,
            sortBy,
            sortDir,
            search,
        });
        const departmentDtos = department_mapper_1.DepartmentMapper.toDtoList(result.items);
        return (0, paginated_1.createPagedResult)(departmentDtos, result.totalItems, page, pageSize);
    }
};
exports.GetDepartmentsHandler = GetDepartmentsHandler;
exports.GetDepartmentsHandler = GetDepartmentsHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_departments_query_1.GetDepartmentsQuery),
    __param(0, (0, common_1.Inject)(department_repository_interface_1.IDepartmentRepository)),
    __metadata("design:paramtypes", [Object])
], GetDepartmentsHandler);
//# sourceMappingURL=get-departments.handler.js.map