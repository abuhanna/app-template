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
exports.GetCurrentUserHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_current_user_query_1 = require("./get-current-user.query");
const user_info_dto_1 = require("../dto/user-info.dto");
const user_repository_interface_1 = require("../../../user-management/domain/interfaces/user.repository.interface");
const department_repository_interface_1 = require("../../../department-management/domain/interfaces/department.repository.interface");
let GetCurrentUserHandler = class GetCurrentUserHandler {
    constructor(userRepository, departmentRepository) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
    }
    async execute(query) {
        const user = await this.userRepository.findById(query.userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        let departmentName = null;
        if (user.departmentId) {
            const department = await this.departmentRepository.findById(user.departmentId);
            departmentName = department?.name ?? null;
        }
        return new user_info_dto_1.UserInfoDto({
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            role: user.role,
            departmentId: user.departmentId,
            departmentName,
        });
    }
};
exports.GetCurrentUserHandler = GetCurrentUserHandler;
exports.GetCurrentUserHandler = GetCurrentUserHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_current_user_query_1.GetCurrentUserQuery),
    __param(0, (0, common_1.Inject)(user_repository_interface_1.IUserRepository)),
    __param(1, (0, common_1.Inject)(department_repository_interface_1.IDepartmentRepository)),
    __metadata("design:paramtypes", [Object, Object])
], GetCurrentUserHandler);
//# sourceMappingURL=get-current-user.handler.js.map