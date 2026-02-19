"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const notifications_controller_1 = require("./presentation/notifications.controller");
const notifications_gateway_1 = require("./presentation/notifications.gateway");
const notification_orm_entity_1 = require("./infrastructure/persistence/notification.orm-entity");
const notification_repository_1 = require("./infrastructure/persistence/notification.repository");
const websocket_notification_service_1 = require("./infrastructure/services/websocket-notification.service");
const notification_repository_interface_1 = require("./domain/interfaces/notification.repository.interface");
const notification_service_interface_1 = require("./domain/interfaces/notification.service.interface");
const commands_1 = require("./application/commands");
const queries_1 = require("./application/queries");
const CommandHandlers = [commands_1.MarkNotificationReadHandler, commands_1.MarkAllNotificationsReadHandler];
const QueryHandlers = [queries_1.GetNotificationsHandler];
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            typeorm_1.TypeOrmModule.forFeature([notification_orm_entity_1.NotificationOrmEntity]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                }),
            }),
        ],
        controllers: [notifications_controller_1.NotificationsController],
        providers: [
            notifications_gateway_1.NotificationsGateway,
            {
                provide: notification_repository_interface_1.INotificationRepository,
                useClass: notification_repository_1.NotificationRepository,
            },
            {
                provide: notification_service_interface_1.INotificationService,
                useClass: websocket_notification_service_1.WebSocketNotificationService,
            },
            ...CommandHandlers,
            ...QueryHandlers,
        ],
        exports: [notification_repository_interface_1.INotificationRepository, notification_service_interface_1.INotificationService],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map