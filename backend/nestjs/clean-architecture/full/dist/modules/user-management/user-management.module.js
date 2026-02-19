"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagementModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const typeorm_1 = require("@nestjs/typeorm");
const users_controller_1 = require("./presentation/users.controller");
const user_orm_entity_1 = require("./infrastructure/persistence/user.orm-entity");
const user_repository_1 = require("./infrastructure/persistence/user.repository");
const user_repository_interface_1 = require("./domain/interfaces/user.repository.interface");
const commands_1 = require("./application/commands");
const queries_1 = require("./application/queries");
const auth_module_1 = require("../auth/auth.module");
const department_management_module_1 = require("../department-management/department-management.module");
const CommandHandlers = [
    commands_1.CreateUserHandler,
    commands_1.UpdateUserHandler,
    commands_1.DeleteUserHandler,
    commands_1.ChangePasswordHandler,
];
const QueryHandlers = [queries_1.GetUsersHandler, queries_1.GetUserByIdHandler];
let UserManagementModule = class UserManagementModule {
};
exports.UserManagementModule = UserManagementModule;
exports.UserManagementModule = UserManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            typeorm_1.TypeOrmModule.forFeature([user_orm_entity_1.UserOrmEntity]),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            (0, common_1.forwardRef)(() => department_management_module_1.DepartmentManagementModule),
        ],
        controllers: [users_controller_1.UsersController],
        providers: [
            {
                provide: user_repository_interface_1.IUserRepository,
                useClass: user_repository_1.UserRepository,
            },
            ...CommandHandlers,
            ...QueryHandlers,
        ],
        exports: [user_repository_interface_1.IUserRepository],
    })
], UserManagementModule);
//# sourceMappingURL=user-management.module.js.map