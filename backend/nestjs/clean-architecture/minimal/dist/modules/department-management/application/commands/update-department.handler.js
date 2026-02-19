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
exports.UpdateDepartmentHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_department_command_1 = require("./update-department.command");
const department_mapper_1 = require("../mappers/department.mapper");
const department_repository_interface_1 = require("../../domain/interfaces/department.repository.interface");
let UpdateDepartmentHandler = class UpdateDepartmentHandler {
    constructor(departmentRepository) {
        this.departmentRepository = departmentRepository;
    }
    async execute(command) {
        const department = await this.departmentRepository.findById(command.id);
        if (!department) {
            throw new common_1.NotFoundException('Department not found');
        }
        if (command.code && command.code.toUpperCase() !== department.code) {
            const existingCode = await this.departmentRepository.findByCode(command.code.toUpperCase());
            if (existingCode) {
                throw new common_1.ConflictException('Department code already in use');
            }
        }
        department.update({
            name: command.name,
            code: command.code,
            description: command.description,
            isActive: command.isActive,
        });
        const savedDepartment = await this.departmentRepository.save(department);
        return department_mapper_1.DepartmentMapper.toDto(savedDepartment);
    }
};
exports.UpdateDepartmentHandler = UpdateDepartmentHandler;
exports.UpdateDepartmentHandler = UpdateDepartmentHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_department_command_1.UpdateDepartmentCommand),
    __param(0, (0, common_1.Inject)(department_repository_interface_1.IDepartmentRepository)),
    __metadata("design:paramtypes", [Object])
], UpdateDepartmentHandler);
//# sourceMappingURL=update-department.handler.js.map