"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentManagementModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const typeorm_1 = require("@nestjs/typeorm");
const departments_controller_1 = require("./presentation/departments.controller");
const department_orm_entity_1 = require("./infrastructure/persistence/department.orm-entity");
const department_repository_1 = require("./infrastructure/persistence/department.repository");
const department_repository_interface_1 = require("./domain/interfaces/department.repository.interface");
const commands_1 = require("./application/commands");
const queries_1 = require("./application/queries");
const user_management_module_1 = require("../user-management/user-management.module");
const CommandHandlers = [
    commands_1.CreateDepartmentHandler,
    commands_1.UpdateDepartmentHandler,
    commands_1.DeleteDepartmentHandler,
];
const QueryHandlers = [queries_1.GetDepartmentsHandler, queries_1.GetDepartmentByIdHandler];
let DepartmentManagementModule = class DepartmentManagementModule {
};
exports.DepartmentManagementModule = DepartmentManagementModule;
exports.DepartmentManagementModule = DepartmentManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            typeorm_1.TypeOrmModule.forFeature([department_orm_entity_1.DepartmentOrmEntity]),
            (0, common_1.forwardRef)(() => user_management_module_1.UserManagementModule),
        ],
        controllers: [departments_controller_1.DepartmentsController],
        providers: [
            {
                provide: department_repository_interface_1.IDepartmentRepository,
                useClass: department_repository_1.DepartmentRepository,
            },
            ...CommandHandlers,
            ...QueryHandlers,
        ],
        exports: [department_repository_interface_1.IDepartmentRepository],
    })
], DepartmentManagementModule);
//# sourceMappingURL=department-management.module.js.map