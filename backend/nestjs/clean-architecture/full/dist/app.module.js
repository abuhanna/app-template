"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const crypto = require("crypto");
const config_1 = require("@nestjs/config");
const core_module_1 = require("./core/core.module");
const auth_module_1 = require("./modules/auth/auth.module");
const user_management_module_1 = require("./modules/user-management/user-management.module");
const department_management_module_1 = require("./modules/department-management/department-management.module");
const notification_module_1 = require("./modules/notification/notification.module");
const file_management_module_1 = require("./modules/file-management/file-management.module");
const audit_log_module_1 = require("./modules/audit-log/audit-log.module");
const health_module_1 = require("./modules/health/health.module");
const export_module_1 = require("./modules/export/export.module");
const seed_module_1 = require("./core/database/seed.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    genReqId: (req, res) => {
                        const correlationId = req.headers['x-correlation-id'] || req.headers['x-request-id'] || crypto.randomUUID();
                        res.setHeader('X-Correlation-Id', correlationId);
                        return correlationId;
                    },
                    transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
                    autoLogging: true,
                },
            }),
            core_module_1.CoreModule,
            seed_module_1.SeederModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            user_management_module_1.UserManagementModule,
            department_management_module_1.DepartmentManagementModule,
            notification_module_1.NotificationModule,
            file_management_module_1.FileManagementModule,
            audit_log_module_1.AuditLogModule,
            export_module_1.ExportModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map