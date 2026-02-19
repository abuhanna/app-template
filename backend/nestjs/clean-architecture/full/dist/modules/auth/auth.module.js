"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const auth_controller_1 = require("./presentation/auth.controller");
const refresh_token_orm_entity_1 = require("./infrastructure/persistence/refresh-token.orm-entity");
const refresh_token_repository_1 = require("./infrastructure/persistence/refresh-token.repository");
const jwt_token_service_1 = require("./infrastructure/services/jwt-token.service");
const bcrypt_password_service_1 = require("./infrastructure/services/bcrypt-password.service");
const email_service_1 = require("./infrastructure/services/email.service");
const jwt_strategy_1 = require("./infrastructure/strategies/jwt.strategy");
const refresh_token_repository_interface_1 = require("./domain/interfaces/refresh-token.repository.interface");
const jwt_token_service_interface_1 = require("./domain/interfaces/jwt-token.service.interface");
const password_service_interface_1 = require("./domain/interfaces/password.service.interface");
const email_service_interface_1 = require("./domain/interfaces/email.service.interface");
const commands_1 = require("./application/commands");
const queries_1 = require("./application/queries");
const user_management_module_1 = require("../user-management/user-management.module");
const department_management_module_1 = require("../department-management/department-management.module");
const CommandHandlers = [
    commands_1.LoginHandler,
    commands_1.RefreshTokenHandler,
    commands_1.LogoutHandler,
    commands_1.RequestPasswordResetHandler,
    commands_1.ResetPasswordHandler,
    commands_1.UpdateProfileHandler,
];
const QueryHandlers = [queries_1.GetCurrentUserHandler, queries_1.GetMyProfileHandler];
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            passport_1.PassportModule,
            typeorm_1.TypeOrmModule.forFeature([refresh_token_orm_entity_1.RefreshTokenOrmEntity]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRES_IN', '15m'),
                    },
                }),
            }),
            (0, common_1.forwardRef)(() => user_management_module_1.UserManagementModule),
            (0, common_1.forwardRef)(() => department_management_module_1.DepartmentManagementModule),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            jwt_strategy_1.JwtStrategy,
            {
                provide: refresh_token_repository_interface_1.IRefreshTokenRepository,
                useClass: refresh_token_repository_1.RefreshTokenRepository,
            },
            {
                provide: jwt_token_service_interface_1.IJwtTokenService,
                useClass: jwt_token_service_1.JwtTokenService,
            },
            {
                provide: password_service_interface_1.IPasswordService,
                useClass: bcrypt_password_service_1.BcryptPasswordService,
            },
            {
                provide: email_service_interface_1.IEmailService,
                useClass: email_service_1.EmailService,
            },
            ...CommandHandlers,
            ...QueryHandlers,
        ],
        exports: [password_service_interface_1.IPasswordService, jwt_token_service_interface_1.IJwtTokenService, refresh_token_repository_interface_1.IRefreshTokenRepository, jwt_1.JwtModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map