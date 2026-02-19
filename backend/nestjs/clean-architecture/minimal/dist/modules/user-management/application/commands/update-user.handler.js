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
exports.UpdateUserHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_user_command_1 = require("./update-user.command");
const user_mapper_1 = require("../mappers/user.mapper");
const user_repository_interface_1 = require("../../domain/interfaces/user.repository.interface");
const department_repository_interface_1 = require("../../../department-management/domain/interfaces/department.repository.interface");
let UpdateUserHandler = class UpdateUserHandler {
    constructor(userRepository, departmentRepository) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
    }
    async execute(command) {
        const user = await this.userRepository.findById(command.id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (command.email && command.email !== user.email) {
            const existingEmail = await this.userRepository.findByEmail(command.email);
            if (existingEmail) {
                throw new common_1.ConflictException('Email already in use');
            }
        }
        if (command.username && command.username !== user.username) {
            const existingUsername = await this.userRepository.findByUsername(command.username);
            if (existingUsername) {
                throw new common_1.ConflictException('Username already in use');
            }
        }
        let departmentName = null;
        if (command.departmentId) {
            const department = await this.departmentRepository.findById(command.departmentId);
            if (!department) {
                throw new common_1.BadRequestException('Department not found');
            }
            departmentName = department.name;
        }
        user.update({
            email: command.email,
            username: command.username,
            firstName: command.firstName,
            lastName: command.lastName,
            role: command.role,
            departmentId: command.departmentId,
            isActive: command.isActive,
        });
        const savedUser = await this.userRepository.save(user);
        return user_mapper_1.UserMapper.toDto(savedUser, departmentName);
    }
};
exports.UpdateUserHandler = UpdateUserHandler;
exports.UpdateUserHandler = UpdateUserHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_user_command_1.UpdateUserCommand),
    __param(0, (0, common_1.Inject)(user_repository_interface_1.IUserRepository)),
    __param(1, (0, common_1.Inject)(department_repository_interface_1.IDepartmentRepository)),
    __metadata("design:paramtypes", [Object, Object])
], UpdateUserHandler);
//# sourceMappingURL=update-user.handler.js.map