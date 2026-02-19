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
exports.CreateDepartmentHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_department_command_1 = require("./create-department.command");
const department_mapper_1 = require("../mappers/department.mapper");
const department_entity_1 = require("../../domain/entities/department.entity");
const department_repository_interface_1 = require("../../domain/interfaces/department.repository.interface");
let CreateDepartmentHandler = class CreateDepartmentHandler {
    constructor(departmentRepository) {
        this.departmentRepository = departmentRepository;
    }
    async execute(command) {
        const existingCode = await this.departmentRepository.findByCode(command.code.toUpperCase());
        if (existingCode) {
            throw new common_1.ConflictException('Department code already in use');
        }
        const department = department_entity_1.Department.create({
            name: command.name,
            code: command.code,
            description: command.description,
        });
        const savedDepartment = await this.departmentRepository.save(department);
        return department_mapper_1.DepartmentMapper.toDto(savedDepartment);
    }
};
exports.CreateDepartmentHandler = CreateDepartmentHandler;
exports.CreateDepartmentHandler = CreateDepartmentHandler = __decorate([
    (0, cqrs_1.CommandHandler)(create_department_command_1.CreateDepartmentCommand),
    __param(0, (0, common_1.Inject)(department_repository_interface_1.IDepartmentRepository)),
    __metadata("design:paramtypes", [Object])
], CreateDepartmentHandler);
//# sourceMappingURL=create-department.handler.js.map