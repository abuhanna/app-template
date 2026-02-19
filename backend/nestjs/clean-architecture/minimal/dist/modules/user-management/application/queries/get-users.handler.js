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
exports.GetUsersHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_users_query_1 = require("./get-users.query");
const user_mapper_1 = require("../mappers/user.mapper");
const user_repository_interface_1 = require("../../domain/interfaces/user.repository.interface");
const department_repository_interface_1 = require("../../../department-management/domain/interfaces/department.repository.interface");
const paginated_1 = require("../../../../common/types/paginated");
let GetUsersHandler = class GetUsersHandler {
    constructor(userRepository, departmentRepository) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
    }
    async execute(query) {
        const { page, pageSize, sortBy, sortDir, search } = query;
        const result = await this.userRepository.findAllPaginated({
            page,
            pageSize,
            sortBy,
            sortDir,
            search,
        });
        const departments = await this.departmentRepository.findAll();
        const departmentMap = new Map(departments.map((d) => [d.id, d.name]));
        const userDtos = result.items.map((user) => user_mapper_1.UserMapper.toDto(user, user.departmentId ? (departmentMap.get(user.departmentId) ?? null) : null));
        return (0, paginated_1.createPagedResult)(userDtos, result.totalItems, page, pageSize);
    }
};
exports.GetUsersHandler = GetUsersHandler;
exports.GetUsersHandler = GetUsersHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_users_query_1.GetUsersQuery),
    __param(0, (0, common_1.Inject)(user_repository_interface_1.IUserRepository)),
    __param(1, (0, common_1.Inject)(department_repository_interface_1.IDepartmentRepository)),
    __metadata("design:paramtypes", [Object, Object])
], GetUsersHandler);
//# sourceMappingURL=get-users.handler.js.map