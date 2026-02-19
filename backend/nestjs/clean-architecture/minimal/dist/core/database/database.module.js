"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const user_orm_entity_1 = require("../../modules/user-management/infrastructure/persistence/user.orm-entity");
const department_orm_entity_1 = require("../../modules/department-management/infrastructure/persistence/department.orm-entity");
const notification_orm_entity_1 = require("../../modules/notification/infrastructure/persistence/notification.orm-entity");
const refresh_token_orm_entity_1 = require("../../modules/auth/infrastructure/persistence/refresh-token.orm-entity");
const uploaded_file_orm_entity_1 = require("../../modules/file-management/infrastructure/persistence/uploaded-file.orm-entity");
const audit_log_orm_entity_1 = require("../../modules/audit-log/infrastructure/persistence/audit-log.orm-entity");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5432),
                    username: configService.get('DB_USERNAME', 'postgres'),
                    password: configService.get('DB_PASSWORD', 'postgres'),
                    database: configService.get('DB_NAME', 'apptemplate_dev'),
                    entities: [
                        user_orm_entity_1.UserOrmEntity,
                        department_orm_entity_1.DepartmentOrmEntity,
                        notification_orm_entity_1.NotificationOrmEntity,
                        refresh_token_orm_entity_1.RefreshTokenOrmEntity,
                        uploaded_file_orm_entity_1.UploadedFileOrmEntity,
                        audit_log_orm_entity_1.AuditLogOrmEntity,
                    ],
                    migrations: [__dirname + '/migrations/*{.ts,.js}'],
                    synchronize: configService.get('DB_SYNCHRONIZE', false),
                    logging: configService.get('DB_LOGGING', false),
                    migrationsRun: true,
                }),
            }),
        ],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map